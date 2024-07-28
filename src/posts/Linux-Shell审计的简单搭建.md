---
author: Albert
date: 2024-06-14
date created: 2024-05-28
tags:
  - Blog
  - 备忘录
  - Linux
title: Linux-Shell审计的简单搭建
---

# Linux-Shell审计的简单搭建

> [!note]
> - [如何用 Shell 轻松搞定 Linux 命令审计-linux ls命令](https://www.51cto.com/article/719934.html)

## 1. 需求

- 实验室有多台服务器，大部分用户的 `shell` 已经统一为 `zsh`，需要统计用户在 `zsh` 下输入的命令，从而做到基本的命令审计。
- 并不追求方案的完备性，亦不需要通过 `eBPF` 做到更加底层的统计，**仅仅只是通过一台日志服务器归档用户的 `shell history`**。
- 目的是统计常规用户的行为，**并非抵抗恶意用户的破坏**。

## 2. 思路

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240528221314.png)

- 如上图所示：
  - 每个用户输入命令之前，`/opt/plugin/help.sh` 中的函数会通过 `zsh hook` 触发一次 `log` 事件；
  - 该事件通过 `rsyslog` 汇报到远程的日志服务器
  - 通过 `rsyslog` 转发到 `ELK` 容器当中
  - 通过 `ELK` 当中的 `web` 面板看到用户历史记录

## 3. 完整流程

### 3.1 服务端

#### 3.1.1  建立 `es-docker`

- 编写 `xxx/es-docker/docker-compose.yml`
- 注意，`es-docker` 对于用户 `UID` 强制设定为 `1000`，请保证 `es` 容器对持久化卷具备读写能力
- 执行 `sudo chown 1000:root -R /data/es-data`

```yaml
  services:
  elasticsearch:
    container_name: elasticsearch
    image: elasticsearch:7.3.1
    ports:
      - "19200:9200"
      - "19300:9300"
    environment:
      - discovery.type=single-node
    restart: always
    privileged: true
    volumes:
      - /data/es-data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana-oss:7.3.1
    container_name: kibana-for-audit
    restart: always
    ports:
      - "127.0.0.1:15601:15601"
    ulimits:
      nofile:
        soft: 100000
        hard: 100000
    volumes:
      - ./kibana.yml:/usr/share/kibana/config/kibana.yml
```

#### 3.1.2 建立 `rsyslog` 服务

- 机器操作系统为 `Debian 12.2`
- 使用下面的命令

```sh
# Ubuntu  
sudo apt-get install -y rsyslog-elasticsearch rsyslog-mmjsonparse  
```

---

- 编写 `/etc/rsyslog.d/40-audit-server.conf`，定义 `rsyslog` 转发策略

```sh

# /etc/rsyslog.d/40-audit-server.conf

$RepeatedMsgReduction off

$ModLoad imudp
$UDPServerRun 514

module(load="mmjsonparse")          # for parsing CEE-enhanced syslog messages
module(load="omelasticsearch")      # for outputting to Elasticsearch

#try to parse a structured log

# this is for index names to be like: rsyslog-YYYY.MM.DD
template(name="rsyslog-index" type="string" string="bashaudit-%$YEAR%.%$MONTH%.%$DAY%")

# this is for formatting our syslog in JSON with @timestamp
template(name="json-syslog" type="list") {
    constant(value="{")
      constant(value="\"@timestamp\":\"")     property(name="timegenerated" dateFormat="rfc3339" date.inUTC="on")
      constant(value="\",\"host\":\"")        property(name="fromhost-ip")
      constant(value="\",\"severity\":\"")    property(name="syslogseverity-text")
      constant(value="\",\"facility\":\"")    property(name="syslogfacility-text")
      constant(value="\",\"program\":\"")     property(name="programname")
      constant(value="\",\"tag\":\"")         property(name="syslogtag" format="json")
      constant(value="\",")                   property(name="$!all-json" position.from="2")
    # closing brace is in all-json
}

if ($syslogfacility-text == 'local6' and $syslogseverity-text == 'info') then {
        action(type="mmjsonparse")
        action(type="omelasticsearch" template="json-syslog" searchIndex="rsyslog-index" dynSearchIndex="on" server="10.176.24.20" serverport="19200")
        # action(type="omfile" file="/var/log/bashaudit.log")
        stop
}
```

- 配置完成之后需要启动 `rsyslog` 服务

```sh
sudo systemctl restart rsyslog && sudo systemctl status rsyslog
```

###  3.2 客户端 

#### 3.2.1 编写 `/opt/plugin/help.sh` 

- 预先安装的依赖：`jq/logger` 
- 该脚本负责触发 `zsh hook`，将命令汇报到远程日志服务器

```shell
#!/bin/zsh

# /opt/plugin/help.sh
# Ensure we're running under Zsh
if [ "${SHELL##*/}" != "zsh" ]; then
  return
fi

# Zsh equivalents for Bash's shopt
setopt APPEND_HISTORY
setopt EXTENDED_HISTORY
setopt HIST_VERIFY
setopt DEBUG_BEFORE_CMD

if groups | grep -q root; then
  declare -x TMOUT=86400
  # chattr +a "$HISTFILE"
fi

declare AUDIT_TTY="${LOGIN_INFO[2]}"

function AUDIT_DEBUG() {
  local LOGIN_INFO=( $(who -mu | awk '{print $1,$2,$6}') )
  local AUDIT_LOGINUSER="${LOGIN_INFO[1]}"
  local AUDIT_LOGINPID="${LOGIN_INFO[3]}"
  local AUDIT_SSH="$([ -n "$SSH_CONNECTION" ] && echo "$SSH_CONNECTION" | awk '{print $1":"$2"->"$3":"$4}')"

  # vscode
  if [[ -z "${LOGIN_INFO}" ]]; then
      AUDIT_LOGINUSER="${USER}"
      AUDIT_LOGINPID="vscode-login: $(date)"
  fi

  local AUDIT_STR="$AUDIT_LOGINUSER  $AUDIT_LOGINPID  $AUDIT_TTY  $AUDIT_SSH"
  local AUDIT_TAG=$(echo -n $AUDIT_STR | sha1sum |cut -c1-12)
  local AUDIT_LASTHISTLINE=""

  local AUDIT_CMD="$(fc -l -1 -1)"
  local AUDIT_HISTLINE="$(echo $AUDIT_CMD | awk '{print $1}')"
  local AUDIT_BODY="$(echo $AUDIT_CMD | awk -F' ' '{$1=""; print $0}')"
  AUDIT_BODY="$(printf "%s\n" "${AUDIT_BODY#"${AUDIT_BODY%%[![:space:]]*}"}")"

  if [ "${AUDIT_HISTLINE:-0}" -ne "${AUDIT_LASTHISTLINE:-0}" ] || [ "${AUDIT_HISTLINE:-0}" -eq "1" ]; then

    MESSAGE=$(jq -c -n \
            --arg pwd "$PWD" \
            --arg cmd "${AUDIT_BODY}" \
            --arg cmd_index "${AUDIT_HISTLINE}" \
            --arg user "$AUDIT_LOGINUSER" \
            --arg become "${USER}" \
            --arg pid "$$" \
            --arg info "${AUDIT_STR}" \
            '{cmd: $cmd, cmd_index: $cmd_index, user: $user, become: $become, pid: $pid, pwd: $pwd, info: $info}')
    logger -p local6.info -t "$AUDIT_TAG" "@cee: $MESSAGE"
  fi
}

function AUDIT_QUIT() {
  local LOGIN_INFO=( $(who -mu | awk '{print $1,$2,$6}') )
  local AUDIT_LOGINUSER="${LOGIN_INFO[1]}"
  local AUDIT_LOGINPID="${LOGIN_INFO[3]}"
  local AUDIT_SSH="$([ -n "$SSH_CONNECTION" ] && echo "$SSH_CONNECTION" | awk '{print $1":"$2"->"$3":"$4}')"

  local AUDIT_STR="$AUDIT_LOGINUSER  $AUDIT_LOGINPID  $AUDIT_TTY  $AUDIT_SSH"
  local AUDIT_TAG=$(echo -n $AUDIT_STR | sha1sum |cut -c1-12)

  MESSAGE_OPENED=$(jq -c -n \
      --arg action "session opened" \
      --arg user "$AUDIT_LOGINUSER" \
      --arg become "${USER}" \
      --arg pid "$$" \
      --arg info "${AUDIT_STR}" \
      '{user: $user, become: $become, pid: $pid, action: $action, info: $info}')
  logger -p local6.info -t "$AUDIT_TAG" "@cee: $MESSAGE_OPENED"
}

if [ -n "$AUDIT_TTY" ]; then
        AUDIT_QUIT
fi

# In Zsh, use precmd instead of PROMPT_COMMAND
precmd() {
        AUDIT_DEBUG
}
```

#### 3.2.2 调整用户的 `.zshrc`

- 将 `source /opt/plugin/help.sh` 添加到每个需要审计的用户的 `${HOME}/.zshrc` 当中
- 需要一个脚本来完成，不妨命名为 `audit_deploy.sh`
- 执行该脚本即可

```sh
#!/bin/bash

function put_plugin {
        local target_dirs="$(ls /home/)"
        target_dirs=($(echo "${target_dirs}"))

        for dir in ${target_dirs[@]}; do
                local zsh_file="/home/${dir}/.zshrc"

                if [[ -f ${zsh_file} ]]; then
                        # if have the line
                        if grep -q "source /opt/plugin/help.sh" ${zsh_file}; then
                                echo "have it"
                                continue
                        fi
                        echo "" >>"${zsh_file}"
                        echo "#------------------------ plugin --------------------" >>"${zsh_file}"
                        echo "source /opt/plugin/help.sh" >>"${zsh_file}"

                        echo "${zsh_file} changed!"
                fi
        done

        echo ${#target_dirs[@]}
}

put_plugin

```

#### 3.2.3 配置 `rsyslog` 客户端

- 编写 `/etc/rsyslog.d/40-audit.conf`

```sh
RepeatedMsgReduction off
local6.info @10.176.24.xxx:514
& stop
```

- 开启 `rsyslog` 服务

```sh
sudo systemctl enable rsyslog \
  && sudo systemctl start rsyslog \
  && sudo systemctl status rsyslog
```

---

- 最后，在 `15601` 端口查看 `kibana` 状态即可，定义一些 `index` 以加速检索，此处不再赘述。
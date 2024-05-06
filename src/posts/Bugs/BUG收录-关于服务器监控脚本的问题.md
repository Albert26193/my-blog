---
author: Albert
date: 2024-04-03
tags:
  - Linux
  - Blog
  - Bug收录
title: BUG收录-关于服务器监控脚本的问题
---

# BUG收录-关于服务器监控脚本的问题

## 1. 问题描述

### 1.1 背景

- 目标脚本 `help.sh` 工作在特定目录下。用户登陆的时候，会通过 `shell` 对该脚本进行 `source` 的操作，其 `~/.zshrc` 定义如下

```bash
source 'xxx/help.sh'
```

- `help.sh` 的工作原理是和远程的日志服务器通信，记录用户行为。具体来说，用户每次输入 `cmd` 之前，将会通过 `zsh` 内置的 `precmd` 这个 `hook` 进行触发，从而将用户输入的命令统一在日志服务器当中管理。
- `help.sh` 的文件内容如下所示

```bash
#!/usr/local/bin/zsh

if [ "${SHELL##*/}" != "zsh" ]; then
  return
fi

if [ "${AUDIT_READY}" = "yes" ]; then
    return
fi

#declare -rx HISTFILE="${ZSH}/cache/.zsh_history"
declare -rx HISTSIZE=500000
declare -rx HISTFILESIZE=500000
declare -rx HISTCONTROL=""
declare -rx HISTIGNORE=""
declare -rx HISTCMD
declare -rx AUDIT_READY="yes"

# Zsh equivalents for Bash's shopt
setopt APPEND_HISTORY
setopt EXTENDED_HISTORY
setopt HIST_VERIFY
setopt DEBUG_BEFORE_CMD

if groups | grep -q root; then
  declare -x TMOUT=86400
  # chattr +a "$HISTFILE"
fi

declare -a LOGIN_INFO=( $(who -mu | awk '{print $1,$2,$6}') )
declare -rx AUDIT_LOGINUSER="${LOGIN_INFO[1]}"
declare -rx AUDIT_LOGINPID="${LOGIN_INFO[3]}"
declare -rx AUDIT_USER="$USER"
declare -rx AUDIT_PID="$$"
declare -rx AUDIT_TTY="${LOGIN_INFO[2]}"
declare -rx AUDIT_SSH="$([ -n "$SSH_CONNECTION" ] && echo "$SSH_CONNECTION" | awk '{print $1":"$2"->"$3":"$4}')"

declare -rx AUDIT_STR="$AUDIT_LOGINUSER  $AUDIT_LOGINPID  $AUDIT_TTY  $AUDIT_SSH"
declare -rx AUDIT_TAG=$(echo -n $AUDIT_STR | sha1sum |cut -c1-12)
declare -x AUDIT_LASTHISTLINE=""

function AUDIT_DEBUG() {
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
            --arg become "$AUDIT_USER" \
            --arg pid "$AUDIT_PID" \
            --arg info "${AUDIT_STR}" \
            '{cmd: $cmd, cmd_index: $cmd_index, user: $user, become: $become, pid: $pid, pwd: $pwd, info: $info}')
    logger -p local6.info -t "$AUDIT_TAG" "@cee: $MESSAGE"
  fi
}

if [ -n "$AUDIT_TTY" ]; then
  MESSAGE_OPENED=$(jq -c -n \
      --arg action "session opened" \
      --arg user "$AUDIT_LOGINUSER" \
      --arg become "$AUDIT_USER" \
      --arg pid "$AUDIT_PID" \
      --arg info "${AUDIT_STR}" \
      '{user: $user, become: $become, pid: $pid, action: $action, info: $info}')
  logger -p local6.info -t "$AUDIT_TAG" "@cee: $MESSAGE_OPENED"
fi

# In Zsh, use precmd instead of PROMPT_COMMAND
precmd() {
  AUDIT_DEBUG
}

```

- 在日志服务器上，用户输入的一条命令，最终会整理成一个 `JSON`。

![image.png|550](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240404214425.png)

### 1.2 症状

- 如果是通过 `terminal` 的 `ssh` 直连，一切表现正常，
- 但是在 `vscode terminal` 当中，**用户输入的所有命令均无法被捕获**。

## 2. 猜测

- 以下是最初的一些猜想，这里进行简单的罗列。

1. `help.sh` 无法被 `source`，导致 `precmd` 无法被触发。
2. `vscode` 存在内置的特殊机制，会屏蔽 `zsh` 的一些行为。
3. `vscode terminal` 可能会触发另外版本的 `zsh`，无法在语法层面兼容。
4. `vscode terminal` 会默认保留一些历史变量，从而干扰当前脚本的行为。（**实际原因**）

## 3. 验证

- 验证并不困难，通过在脚本当中的多个位置放入 `echo`，然后重新通过 `vscode terminal` 进行登陆验证即可。
- 分别在 _脚本开始位置、`precmd` 触发位置， `DEUBG` 函数体内部_ 等可疑位置放入 `echo`，观察 `echo` 输出，即可判定问题的来源。
- 最终，验证的结果是，**`vscode terminal` 会保留一些历史的环境变量，从而干扰脚本的加载**。具体来说，`#${AUDIT_READY}` 变量会在多次会话当中保留， 从而触发提前 `return` 的代码分支。

```bash
if [ "${AUDIT_READY}" = "yes" ]; then
    return
fi
```

## 4. 解决办法

- 一句话总结问题原因：**在 `shell` 文件当中，直接定义全局变量需要谨慎考虑，_非常容易造成变量的泄漏和污染_**。
- 解决方案也比较直接，将原本的功能封装成函数，在 `precmd` 当中触发特定的函数即可。
- 具体莱施，就是原本的全局变量放到函数当中，尽量避免全局变量。
- 修正之后的 `help.sh` 脚本内容如下所示。修改后脚本可以正常工作。

```bash
#!/usr/local/bin/zsh

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

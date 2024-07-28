---
author: Albert
date: 2024-06-05
date created: 2023-12-25
mindmap-plugin: basic
tags:
  - Blog
  - Linux
  - 备忘录
title: Linux-ACME备忘录
---

# Linux-ACME备忘录

## 1. 生成密钥

- 建议全程使用 `root` 用户操作，防止环境变量出错
- 用 `DNS` 方式添加 `key` 如下：

```shell
export Ali_Key=xxxxxxxxxxxxxx
export Ali_Screct=xxxxxxxxxxxxxxx

./acme.sh --issue --dns dns_ali -d lab-server.cn -d www.lab-server.cn -d monitor.lab-server.cn -d *.lab-server.cn
```

- 如果 `Ali_Key` 没有读到，请手动添加到 `account.conf` 当中

```shell
root@Debian-7302:~/.acme.sh# cat account.conf

LOG_FILE='/root/.acme.sh/acme.sh.log'
#LOG_LEVEL=1

#AUTO_UPGRADE="1"

#NO_TIMESTAMP=1

ACCOUNT_EMAIL='my@example.com'
UPGRADE_HASH='afacdfcb95e063325d8f01ebc8daa57322307d92'

SAVED_Ali_Key='xxxxxxxxxx'
SAVED_Ali_Secret='xxxxxxxxxxxxxxxx'

USER_PATH='/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
```

- 执行成功的结果如下所示

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20231220220020.png)

- 生成了 4 个文件， 实际上需要在 `nginx` 当中使用的是两个

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20231220220155.png)

1. `fullchain.cer`
2. `finance.albert.cool.key`

---

- 这两个文件需要拷贝到 `/etc/nginx/ssl` 目录当中

```shell
# 进入目录
$ cd ./xxx_ecc

# 创建 ssl
mkdir /etc/nginx/ssl

# 拷贝过去
cp ./xxx.cer ./fullchain.key /etc/nginx/ssl

```

## 2. `Nginx` 配置

- `Nginx` 配置如下所示
- 注意，如果是打包出来的 `dist` 文件，所有权转移至 `www-data` 用户 。

```shell
 # blog
        server {
           listen 80;
           listen 443 ssl;
           listen [::]:443 ssl;
           server_name blog.albert.cool;

           ssl_certificate "/etc/nginx/ssl/blog.fullchain.cer";
           ssl_certificate_key "/etc/nginx/ssl/blog.albert.cool.key";

           if ($scheme = http) {
               return 301 https://$host$request_uri;
           }

           location / {
               root /opt/my-blog/dist/;
               index index.html index.htm;
           }

           # 配置访问日志地址
           access_log  /opt/my-blog/log/access.log;
           error_log  /opt/my-blog/log/error.log;
        }


        # temp
        server {
            listen 5000;

            location / {
                root /opt/my-blog/dist;
                index index.html index.htm;
                try_files $uri $uri/ /index.html;
        }
}

```

## 3. 从 `acme` 到 `nginx`

- 一个简单的自动化脚本，将 `acme` 当中的内容拷贝到 `nginx` 指定的证书目录当中

```sh
#!/bin/bash

#acme.sh --set-default-ca --server letsencrypt

if [[ -z $1 ]]; then
	echo "no argument"
	exit 1
fi

declare -r site="$1"
declare -r acme_path="/home/albert/.acme.sh"
declare -r domain_name="albert.cool"
declare -r temp_install_path="${acme_path}/temp_ssl"
declare -r install_path="/etc/nginx/ssl"
declare -r full_url="$1.${domain_name}"
declare -i is_force=0

if [[ -n $2 && $2 == "--force" ]]; then
	is_force=1
	echo "Force renw it!"
fi

function acme_get {
	if [[ ${is_force} -eq 0 ]]; then
		bash "${acme_path}/acme.sh" --issue --dns dns_ali -d "${full_url}"
	else
		bash "${acme_path}/acme.sh" --issue --dns dns_ali -d "${full_url}" --force
	fi
}

function acme_install_cert {
	bash "${acme_path}/acme.sh" --install-cert -d "${full_url}" \
		--cert-file "${temp_install_path}/${full_url}.cer" \
		--key-file "${temp_install_path}/${full_url}.key" \
		--fullchain-file "${temp_install_path}/${site}.fullchain.cer" &&
		sudo cp ${temp_install_path}/* "${install_path}"
}

function acme_show_nginx_block {
	echo "server {
            listen 80;
            listen 443 ssl;
            listen [::]:443 ssl;
            server_name ${site}.albert.cool;

            ssl_certificate \"/etc/nginx/ssl/${site}.fullchain.cer\";
            ssl_certificate_key \"/etc/nginx/ssl/${site}.albert.cool.key\";

            if (\$scheme = http) {
                return 301 https://\$host\$request_uri;
            }

            location / {
                proxy_pass http://127.0.0.1:3002;
                #proxy_set_header Host \$host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$remote_addr;
            }
    }"
}
#acme_get &&
acme_install_cert &&
	acme_show_nginx_block &&
	sudo systemctl restart nginx

```
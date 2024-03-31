---
author: Albert
category: CS-基础
date: 2024-02-22
date created: 2023-05-09
date updated: 2023-08-02 19:31
description: Linux常用命令
tags:
  - Linux
  - Command
title: Linux-SSH操作
---

# Linux-SSH操作

## 1. 什么是SSH？

Secure Shell 是一个建立在应用层之上的加密协议。SSH提供了一个安全的隧道，可以在不安全的网络环境里面传输信息。**如果有多个服务器需要连接，通过SSH就可以使用本地终端登录到远程服务器当中** 。SSH也支持文件的传输。 

## 2. SSH登录

> 3个主要的步骤：
>
> 1. 连接
> 2. 配置config
> 3. 配置公钥

## 2.1 连接

- `ssh user@host`，譬如`ssh albert@192.168.1.1`接公网IP即可，`user`是用户名，`host`是域名或者IP。
- 第一次连接会出现`xxxx, Are you sure you want to continue connecting (yes/no/[fingerprint])?`选择`yes`之后，相关信息会存在`~/.ssh/known_hosts`
- 如何指定端口?`ssh user@host -p 22`，指定客户端端口号为`22`。 

## 2.2 配置config

- 配置`config`的目的在于让客户端记住连接的操作，下次连接的时候更方便一点。。
- 编辑客户端目录下`~/.ssh/config`文件，作如下改动：

```bash
Host myserver1
  HostName IP地址或域名
  User 用户名

Host myserver2
  HostName IP地址或域名
  User 用户名
```

## 2.3 配置公钥

- 创建密钥，客户端终端输入：`ssh-keygen`
- 创建之后， 客户端的 `~/.ssh/`目录下，将会出现2个文件，分别是 `~/.ssh/id_rsa`和`~/.ssh/id_rsa.pub`，前者是私钥，后者是公钥。
- *把公钥放到服务端*，即服务端的`~/.ssh/authorized_keys`文件和客户端的`~/.ssh/id_rsa.pub`一致。就可以不用输入密码登录.
- 必须是 **authorized_keys** 命名，才能被系统识别到
- 上面的操作可以用一个命令生成：`ssh-copy-id myserver` 

## 3. SSH传输文件

- 传输文件`scp source destination`
- 传输多个文件：`scp 1.txt 2.txt destination`
- 传输目录：`scp -r ./files destination`
- 将`1.cpp`传输到服务端：`scp 1.cpp server:/home/`
- 将服务端目录 `list/`传输到客户端当前目录下：`scp server:/list/ .`
- 指定服务器端口号：`scp -P 22 1.txt server:/home/`
- 连接成功之后，在本地，可以执行`ssh name@server command`，比如`ssh name@server ls -a`。

***

- 一般而言，我自己喜欢`ssh name@myserver command`这样的方式。比直接切到远程服务器上要方便。但是需要注意一个点，就是`ssh name@myserver ~/xxx`当中的`~`，本地的shell会将其解析成本地的目录。因此，想访问远程服务器`myserver`上`/home/myname/1.txt`文件，写成`ssh name@myserver ~/1.txt`会找不到目标文件，正确的写法是`ssh name@myserver ./1.txt`。

## 4. 常见问题解决

### 4.1 连接实验室服务器

- 现有一个场景，客户端的`~/.ssh`目录下，已经存在了旧的`ssh`公钥和私钥。学姐给了我实验室服务器的私钥，需要进行`ssh`连接。
- 编辑`config`文件，使得其结构如下所示

```shell
Host aliyun0605
    HostName 139.224.229.36
    User albert
    Port 22
    IdentityFile /Users/albert/.ssh/id_rsa

Host lab20221226
    HostName 10.176.24.30
    User root
    Port 22
    IdentityFile /Users/albert/.ssh/id_rsa_lab20221226
```

- 将私钥复制到`~/.ssh/id_rsa_lab20221226`

### 4.2 确保文件只对我可读可写

- 创建出来的新的私钥文件需要保证只对“我”可读可写（否则不安全）
- 甚至只对我可读

![|525](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20221226192707.png)

### 4.3 SSH指定密钥文件

```shell
ssh -i key_file me@server.address
```

### 4.4 日志文件存放在哪里

```shell
tail -f /var/log/auth.log
```

### 4.5 `known_host` 起到什么作用

- 保存已知公钥和对应服务器的文件
- 单行的大文件，一行就是一个服务器的地址和对应的公钥
- 连接的时候会检查服务器的公钥是否和 `known_host` 当中的匹配
- 如果不匹配，就报错
- 通过这个机制来防范中间人攻击
- 如果这个文件修改，那么 `known_host.old` 会提前保存上个版本的 `known_host`

---

> [!tip]
> - 具体是怎么防范中间人攻击的？
> - 比如某个坏蛋服务器劫持了本地向目标服务器的请求
> - 然后这个坏蛋服务器就获得了本地和目标服务器通信的私钥
> - 但是如果本地的 `known_host` 文件设置得当，那么就会发出警告，告诉用户**你的目标服务器和公钥的匹配关系发生了变化**。

## 5. 服务端`sshd`配置

- 配置文件位置 `/etc/ssh/sshd_config`
- 禁用密码登陆

```sh
# grep -n "pass" 能够一定程度提升效率
passwordAuthentication yes or no
```

- 禁用root登陆

```sh
PermitRootLogin prohibit-password**
# or
- PermitRootLogin yes
```
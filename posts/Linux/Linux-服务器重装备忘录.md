---
author: Albert
date: 2024-02-22
date created: 2023-12-25
date updated: 2023-0982-049 106:42
description: 运维过程当中的一些实践，作为备忘录使用。
link: https://www.notion.so/CS-Linux-6b432a1b3
notionID: 6b432a1b-3569-4043-a3ff-b56ce5fd9916
tags:
  - Blog
  - Linux
  - 运维备忘录
title: Linux-服务器重装备忘录
---

# Linux-服务器重装备忘录

## 1. 前置 Misc 操作

1. 多操作系统启动盘，`Ventoy` 似乎是个不错的选择

## 2.格式化特定分区

1. 利用 `archLinux` 启动盘 或其他办法

## 3. 修改主机启动方式位 `UEFI`启动

- 按 `F2` 进入 `BIOS` 设置，修改启动方式位 `UEFI` 启动

## 4. 网络配置

### 4.1 DHCP（机房里面直接修改静态的就行）

- 调整网络配置 `/etc/network/interfaces`，使得其形如：

```sh
auto enp6s0f0
iface enp6s0f0 inet static
    address 10.176.25.53
    netmask 255.255.254.0
    gateway 10.176.24.1
```

- `address` 是静态地址，需要按照不同机器进行分配
- `netmask` 是子网掩码，为 `23` 位，该长度固定。
- `gateway` 是网关，可由子网掩码计算得出，固定。

### 4.2 学校的网络认证

- 完成学校的网络认证，注意，`Debian` 预装了 `wget` 而非 `curl`
- 挂载 U 盘

```sh
#pwd /root

mount /dev/xxx ./install_tmp && cp ./login_test.sh ..
```

- 完成 U 盘当中认证脚本 `login_test` 的拷贝

```sh
#!/bin/bash

URL="https://10.108.255.249/include/auth_action.php"
username="my_student_id"
password="my_school_passwd"

wget --no-check-certificate --post-data="action=login&username=$username&password=$password&ac_id=1&nas_ip=&user_mac=&save_me=1&ajax=1" -qO- $URL

```

- 运行

```sh
bash login_test.sh
```

## 5. SSH 配置

### 5.1 禁用高危操作

- `Debian` 默认已经禁用了密码登陆了，但是最好还是能够修改 `/etc/ssh/sshd_config` 文件，对齐进行显示修改
- 首先定位到所在行

```sh
cd /etc/ssh/

# 结果为第57行
grep -n "Pass" ./sshd_config
```

- 然后，将注释取消，将 `yes` 修改为 `no`

```sh
#line 57:
PasswordAuthentication no
```

### 5.2 生成秘钥

- 生成秘钥

```sh
# 生成秘钥
ssh-keygen -t rsa -b 4096
```

- 将公钥改名为 `authorized_keys`

```sh
cd ./.ssh
cat id_rsa.pub >> authorized_keys
rm id_rsa.pub
```

- 将私钥拷贝到 U 盘（临时挂载点）上面

```sh
cp ./id_rsa ../install_tmp
```

- 这一步完成之后，即可回到实验室，不用留在机房里面了 🍺

---

## 6. 修改 `DNS` 服务器

- 修改配置文件

```bash
vi /etc/resolv.conf
```

- 添加如下内容

```sh
# 在原始文件基础上添加
nameserver 202.120.224.26
nameserver 114.114.114.114
nameserver 8.8.8.8
```

- 重新加载配置文件

```sh
/etc/init.d/networking restart
```

## 7. 修改 `apt` 文件

- 在 `/etc/apt/sources.list` 当中，删除指向 `dvd` 的条目，并整体换源

```sh
# 统一采用阿里云镜像
deb https://mirrors.aliyun.com/debian/ bookworm main non-free non-free-firmware contrib
deb-src https://mirrors.aliyun.com/debian/ bookworm main non-free non-free-firmware contrib
deb https://mirrors.aliyun.com/debian-security/ bookworm-security main
deb-src https://mirrors.aliyun.com/debian-security/ bookworm-security main
deb https://mirrors.aliyun.com/debian/ bookworm-updates main non-free non-free-firmware contrib
deb-src https://mirrors.aliyun.com/debian/ bookworm-updates main non-free non-free-firmware contrib
deb https://mirrors.aliyun.com/debian/ bookworm-backports main non-free non-free-firmware contrib
deb-src https://mirrors.aliyun.com/debian/ bookworm-backports main non-free non-free-firmware contrib
```

- 执行升级命令

```sh
#root
apt-get update && apt-get upgrade

# 安装必要软件
apt-get install tmux zsh vim neofetch git sudo curl rsync duf zip unzip screen fzf fd-find
```

---

## 8. 配置 `sudo`

- 注意: `Debian` 的 `visudo` 操作是使用 `nano` 来进行的。如果不喜欢 `nano` ，想要换成 `vim` ，请使用如下指令：

```sh
update-alternatives --config editor
 # 进入可选列表之后选择 vim
```

- 编辑 `visudo`，禁用特定用户的特定权限

---

## 9. 配置 `installer` 用户的 `ssh-key`

- 结合 `onekey_zsh` 脚本

## 10. 设置时钟同步

- 硬件时钟矫正 `hwclock`
- 设置时间 `date` 和 `hwclock` 同步

```sh
 sudo hwclock --systohc
```

- 修改时间为 `24小时`

---

- 重新加载守护进程配置文件

```sh
sudo systemctl daemon-reload
# 按照 /etc/fstab 重新挂载
&& mount -a
```

#Blog

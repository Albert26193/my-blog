---
author: Albert
date: 2024-03-08
tags:
  - Blog
  - Bug收录
  - Linux
title: Bug收录-OpenStack平台崩溃修复记录
---

# Bug收录-OpenStack平台崩溃修复记录

## 1. 概况

- `2024/03/08` 凌晨的时候，学院机房断电，虽然 `OpenStack` 平台的底层服务按照手册的内容进行了关闭，但是重启之后还是无法运行。
- 该平台在 `2019` 年搭建，硬件已经非常老旧了。
- _硬件情况_：`5` 台同构的 `CentOS 7`，`IP` 地址为 `10.176.25.7/8/9/10/11`。
- 拿到了前任运维的手册，大概清楚了底层是基于 `docker` 来提供服务的。

## 2. 定位 `MongoDB` 问题

- 提供 `Web` 入口的机器为 `10.176.25.9`，该机器上面执行 `docker ps -a`，发现有容器在不断 `restart`
- 其中，比较典型的是下面这个

```text
6cb: mongoDB
```

- 看到这里差不多已经可以猜到了，可能是关闭服务的时候，数据库没有正常关闭，导致了启动失败。
- 那么，执行以下命令，查看日志：

```bash
docker log 6cb
```

- 输出如下

```text
++ chmod 755 /var/log/kolla/mongodb
++ [[ -n '' ]]
+ echo 'Running command: '\''/usr/bin/mongod --unixSocketPrefix=/var/run/mongodb --config /etc/mongodb.conf run'\'''
+ exec /usr/bin/mongod --unixSocketPrefix=/var/run/mongodb --config /etc/mongodb.conf run
Running command: '/usr/bin/mongod --unixSocketPrefix=/var/run/mongodb --config /etc/mongodb.conf run'
**************
old lock file: /var/lib/mongodb/mongod.lock.  probably means unclean shutdown,
but there are no journal files to recover.
this is likely human error or filesystem corruption.
please make sure that your journal directory is mounted.
found 1 dbs.
see: http://dochub.mongodb.org/core/repair for more information
```

- 提示存在 `lock-file`，导致启动失败，**尝试去执行 `docker exec -it 6cb /bin/bash` 是没有意义的，容器无法启动**。
- 既然容器因为 `lock-file` 无法启动，那么，这个 `lock-file` 肯定是从什么地方加载出来的。
- 因此，执行 `docker inspect 6cb`，**这一步的目的，是判断 `-v` 信息到底映射了哪些内容**。

```bash
docker inspect 6cb

# "HostConfig": {
# 38             "Binds": [
# 39                 "kolla_logs:/var/log/kolla/:rw",
# 40                 "/etc/localtime:/etc/localtime:ro",
# 41                 "/etc/kolla//mongodb/:/var/lib/kolla/config_files/:ro",
# 42                 "mongodb:/var/lib/mongodb:rw"
# 43             ],

```

- ` "mongodb:/var/lib/mongodb:rw"` 这里是比较关键的，映射了所在目录，并且开放了读写权限。
- 但是，这里的 `mongodb` 是一个相对路径，我需要找到它在系统上面的准确位置。那么，需要定位到 `docker info` 当中提供的 `docker root dir`。

```bash
 docker info | grep -in "root"

# 39: Docker Root Dir: /var/lib/docker

find /var/lib/docker -name mongodb

# 进一步去找，会有大量无效输出，用 grep -v 反向过滤掉其中大部分内容
# /var/lib/docker/volumes/kolla_logs/_data/mongodb
# /var/lib/docker/volumes/mongodb  # 目标目录

```

## 3. 修复 `MongoDB` 问题

- 手动删除 `mongod.lock` 文件，这个文件是为了防止两个进程同时写目标目录
- 这里采取删除的方式

```bash
[root@compute39 docker]# cd /var/lib/docker/volumes/mongodb/
[root@compute39 mongodb]# ls
_data
[root@compute39 mongodb]# cd _data/
[root@compute39 _data]# ls -al
total 48292872
drwxr-x---. 3 42432 65534       4096 Sep 26  2020 .
drwxr-xr-x. 3 root  root          19 Sep 21  2020 ..
drwxr-xr-x. 2 42432 65534          6 Mar  7 18:24 journal
-rw-------. 1 42432 65534   67108864 Oct 26  2020 local.0
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.1
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.10
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.11
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.12
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.13
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.14
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.15
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.16
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.17
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.18
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.19
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.2
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.20
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.21
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.22
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.23
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.3
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.4
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.5
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.6
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.7
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.8
-rw-------. 1 42432 65534 2146435072 Sep 21  2020 local.9
-rw-------. 1 42432 65534   16777216 Oct 26  2020 local.ns
-rwxr-xr-x. 1 42432 65534          2 Oct 26  2020 mongod.lock
[root@compute39 _data]# rm mongod.lock
rm: remove regular file ‘mongod.lock’? y
```

- 然后重启启动对应容器，采用 `watch -n 2 "docker ps -a | grep 'mongo'"` 观察其状态。发现其状态正常。

## 4. 修复 `MariaDB` 问题

> [!note]
>
> - 这一部分排查起来比较费力，在日志当中，没有明确的错误信息。
> - 经历的过程：_找到问题和 `MariaDB` 相关_，然后，_搞清楚 `MariaDB` 起到的作用是什么（作用是同步多个节点的状态）_，再然后，_查询官方文档，是否封装了恢复节点状态的命令_，最后，找到命令，并且执行。

- 此外，在多个 `Master` 节点当中，多个 `MariaDB` 容器报错。
- 检索 `docker logs` 和 `docker inspect` 发现 `MariaDB` 容器本身并无异常。
- **需要弄清楚 `MariaDB` 在 `OpenStack` 当中的作用，而不是直接去操作，这一步需要首先想清楚**，结合 `Google` 和 `ChatGPT` ，基本上清楚其作用是用来*同步多个节点的状态*。
- 那么，后续的操作，应该是尝试去 `Recovery`，通过查阅官方的文档，查询到了具体的指令，执行即可

```bash
 kolla-ansible  -i /home/multinode  mariadb_recovery

# success
```

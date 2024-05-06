---
author: Albert
category: CS-基础
date: 2024-02-22
date created: 2023-05-09
tags:
  - Blog
  - Linux
title: Linux-Linux目录结构
---

# Linux-Linux目录结构

![|650](http://img-blog-01.oss-cn-shanghai.aliyuncs.com/img/2022-11-27-193717.jpg)

- `/bin`:`bin == Binary` 二进制文件目录，存放常用命令
- `/boot`: 启动 Linux 的核心文件，包括连接文件和镜像文件等等
- `/dev`:`dev == device`，存放 Linux 的外部设备，外部设备在 Linux 系统当中，访问的形式和访问文件的形式是相同的
- `/etc`: **存放所有的系统管理需要的配置文件和各级子目录**
- `/home`: 存放各个用户所需要的各类文件
- `/lib`: 存放系统需要的最基本的动态链接库（有点像 Windows 里面的 DLL 文件，几乎所有的应用程序都需要用到这些共享库）
- `/root`: 超级用户管理员的主目录
- `/sbin`: `s == superUser` 存放系统管理员使用的系统管理程序
- `/usr`: 用户的应用程序和文件被存放在其中，类似 `Windows` 下的 `program files` 目录
- `/usr/bin`：用户使用的应用程序
- `/usr/src`：内核源代码默认的放置目录
- `/var`：各种日志文件

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230608225357.png)

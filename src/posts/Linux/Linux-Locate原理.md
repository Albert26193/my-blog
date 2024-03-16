---
author: Albert
date: 2024-03-16
date created: 2023-05-09
date updated: 2023-01-10 15:25
description: Linux基本常识
link: https://www.notion.so/Linux-Locate-a665b02d675a47a5a23f775c6371267f
notionID: a665b02d-675a-47a5-a23f-775c6371267f
tags:
  - Blog
  - Linux
title: Linux-Locate原理
---

# Linux-Locate原理

## 1.Locate 原理

- Locate查找并不是动态的，不能够实时去查找目录
- 其本质原理在于，利用`updatedb`命令去建立一个索引数据库，这个数据库包括所有的档案和目录。
- 索引数据库的位置一般是`/var/lib/mlocate/mlocate.db`，通过这个数据库可以找到需要的条目
- 一般系统会定时去更新`mlocate.db`，也可以通过`updatedb`命令去手动更新
- `/var`目录一般存放系统的各种日志
- `locate`出来的结果是很多的，需要通过正则或者一些工具去过滤

## 2.Locate的应用

- 比如实验室需要配置`pip`的环境，我被分配了一台主机，主机有很多人用过，我需要找到`pip.conf`的具体位置
- `whereis pip`查找不到具体的配置文件
- 因此，需要使用`locate pip`去查找，但是查找出来的结果非常多
- 利用`grep`或者`locate`自带的正则表达式工具去过滤

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230110151924.png)

- 上图是直接执行`locate pip`的结果，需要利用正则工具过滤。

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230110152540.png)

- 过滤之后的结果如上图所示，利用`grep`过滤。
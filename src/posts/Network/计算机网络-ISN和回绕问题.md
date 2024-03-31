---
author: Albert
date: 2024-02-22
date created: 2023-05-09
date updated: 2023-04-14 18:24
description: 计算机网络常识
tags:
  - network
  - interview
title: 计算机网络-ISN和回绕问题
---

# 计算机网络-ISN和回绕问题

## 1. 对于客户端和服务端，都需要ISN

1. ISN：`Initial Sequence Number, ISN`，初始序列号
2. 在建立连接之初，通信双方都会各自选择一个序列号，称之为初始序列号。在建立连接时，通信双方通过 SYN 报文交换彼此的 ISN，如下图所示

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230414182308.png)

## 2. 序列号回绕问题

1. 如果`seq`号已经满了，即到了`2^32 - 1`
2. 那么，`seq`就需要从0开始，这种现象称为`序列号回绕`

>[!tip]
为了解决这个问题，就需要有 `TCP` 时间戳。`tcp_timestamps` 参数是默认开启的，开启了 `tcp_timestamps` 参数，`TCP` 头部就会使用时间戳选项，它有两个好处，一个是便于精确计算 `RTT` ，另一个是能防止序列号回绕（`PAWS`）。
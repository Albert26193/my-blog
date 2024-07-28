---
author: Albert
category: CS-基础
date: 2024-07-09
date created: 2024-06-11
tags:
  - Blog
  - Network
  - interview
title: 计算机网络-Linux服务器中出现大量time_wait的解决办法
---
#Blog #Network #interview 

# 计算机网络-Linux服务器中出现大量time_wait的解决办法

## 1. 为什么会出现大量 `time_wait` 状态

![image.png|500](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240216150748.png)

- 高并发场景下，服务器需要频繁建立和断开连接，导致大量 `time_wait` 状态出现。
- 如果服务器使用的是 `HTTP 1.0`，默认没有开启长连接，那么每次请求都需要建立新的连接。
- 如果客户端出现了异常情况，比如不发送 `FIN` 报文了，那么服务端就会吃满整个 `time_wait` 时间段（也就是 `2*MSL`, `Max Segment Lifetime`，在 `Linux` 上面是 `30` 秒，那么 `time_wait` 时间就是 `60s`） 

## 2. 如何解决

- 调整 `net.ipv4.tcp_tw_reuse` 内核参数，允许重用 `time_wait` 状态所占据的端口
- 调整 `net.ipv4_tcp_fin_timeout` 内核参数，减少 `time_wait` 状态维持的时间。

## 3. 为什么不默认配置 `tcp_tw_reuse` 

- 无论是允许复用 `time_wait` 状态的端口就是降低 `time_wait` 状态的持续时间，**本质上都相当于跳过了 `time_wait` 状态**，这样会导致两个问题：
    1. 历史的 `RST` 报文不会被 `time_wait` 状态过滤，历史报文会干扰后续的连接
    2. 如果第四次挥手失败（即 `ACK` 报文丢失了），那么，被动关闭方可能不能正确关闭
- 简单说，调整该内核参数，就是为了在高并发场景下**牺牲鲁棒性，来节省性能消耗**。
---
author: Albert
date: 2024-02-22
date created: 2023-12-01
date updated: 2023-12-01 16:47
description: 计算机网络常识
tags:
  - Blog
  - network
  - interview
title: 计算机网络-MSL的设计
---

#network #interview

# 计算机网络-MSL的设计

## 1. 什么是 `MSL`

- `MSL`的全称： `Max Segment Lifetime`，也就是 `TCP` 报文的最大生存时间
- 这个指标并没有反映在 `TCP`头部，而是按照 `IP` 数据包的头部当中的 `TTL(time to live)` 进行计算。
- `TTL` 规定了 `IP`数据包允许经过的路由器的*跳数*，经过一条路由就减少一次。

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20231201162820.png)

- 一般来说，`MSL` 在 `Linux` 当中的默认设置是 `60s`，这个时间用来保证超时的报文能够被丢弃。

## 2. `Time-Wait` 状态和 `MSL`

- 在四次挥手完毕之后，主动断开方会进入 `time-wait` 状态，也就是**等一段时间，确保迷路的报文全部死掉，以免干扰未来的新连接**
- 当然，它还有另外一个用途，就是如果主动方的*最后一次握手 `ACK`丢失*，那么被动方会重传 `FIN`报文，这个时候主动断开方还在 `time-wait` 状态里面，可以正确处理。（简单说，就是**多坚持一会儿，防止最后一次挥手出什么差错**）

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20231201164501.png)

- 这个等待的时间就是 `2*MSL`，为什么是 `2`倍呢？
- 1 个 `MSL` 确保四次挥手中主动关闭方最后的 `ACK` 报文最终能达到对端
- 1 个 `MSL` 确保对端没有收到 ACK 重传的 `FIN` 报文可以到达
  `2MS` = 去向 `ACK` 消息最大存活时间（`MSL`) + 来向 FIN 消息的最大存活时间（`MSL`）

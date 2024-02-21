---
author: Albert
category: CS-基础
date: 2024-02-22
date created: 2023-05-09
date updated: 2024-02-07 00:11
description: 计算机网络常识
tags:
  - network
  - interview
title: 计算机网络-ping背后的原理
---

# 计算机网络-ping背后的原理

- ping工作在网络层上，直接调用传输层的ICMP协议。

> [!citation]
> [深入理解ICMP协议 - 知乎](https://zhuanlan.zhihu.com/p/369623317)

## 1. `ICMP` 协议的内容

- 全称 `Internet Control Message Protocal`
- 设计该协议的目的就是为了诊断网络环境当中的各类问题
- `ICMP` 工作在网络层上面，但是比较特殊的是，它不像 `IP` 协议 或者 `ARP` 协议 那样直接和数据链路层交互，而是*先封装成 `IP` 数据包，然后再传输给数据链路层*。
- 在 `IP` 报文当中，有一个协议字段，协议字段为 `1` ，就说明该 `IP` 数据包当中的内容是 `ICMP` 报文。
- `ICMP` 主要的功能包括：确认 `IP` 包是否成功送达目标地址、报告发送过程中 `IP` 包被废弃的原因和改善网络设置等。

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240206233447.png)

---

- `ICMP` 协议的组成如下图所示

![image.png|450](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240206233750.png)

## 2. `ICMP` 包的分类

- 用于诊断的查询消息，所谓 **查询报文类型**
- 通知出错原因的错误消息，也就是 **差错报文类型**

![image.png|400](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240206235744.png)

---

- 对于 **查询报文** 而言
- 比如发送端和接收端两台主机，如果利用 `ICMP` 协议进行通信的话，发送端会发送类型 `8`（我需要你把状态汇报给我），接收端会分送类型 `0` （我接收了你的请求，现在发送应答消息）

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240207000008.png)

---

- 对于**差错控制报文**而言，也分为多种类型，每种类型对应着一个代码号。

![image.png|400](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240207000148.png)

## 3. `ping` 的原理

- 如果 `A` 对 `B` 进行 `ping` 操作：
  - `A` 构造一个 `ICMP` **回送请求消息**（类型号为 `8`，即**我需要确认你的状态，如果你是健康的，请回复我一个 `0` 类型号的报文**），同时，这个 `ICMP` 数据包当中还需要包含*序号*，因为需要区分连续 `ping` 的时候发出的多个数据包。还包括其他很多字段，*消息类型* 和 *序号* 是最核心的两个。
  - `A` 所构造的 `ICMP` 报文，会被先后封装 `IP` 头，`MAC` 头，**就像一个普通的 `IP` 数据包一样** 层层封装，然后经过 `IP/ARP` 协议的解析，被发送给目标 `B`。
  - `B` 收到报文后，如果正常，就构造一个 **回送应答消息**，类型号 `0`，即**我已经收到了的消息，我现在是健康的，通知一下你**。

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240207001034.png)

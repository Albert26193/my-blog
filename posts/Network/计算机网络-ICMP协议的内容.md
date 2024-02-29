---
author: Albert
category: CS-基础
date: 2024-02-29
date created: 2023-05-09
date updated: 2022-12-07 23:10
tags:
  - Blog
  - network
title: 计算机网络-ICMP协议的内容
url: https://www.yuque.com/albert-tdjyy/bp5vz7/gss5d8
---


# 计算机网络-ICMP协议的内容

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

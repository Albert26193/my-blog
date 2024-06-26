---
author: Albert
date: 2024-02-22
date created: 2023-05-09
tags:
  - Blog
  - interview
  - Network
title: 计算机网络-TCP头部的设计
---

# 计算机网络-TCP头部的设计

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230414150654.png)

## 1. 关于 Seq的设计

### 1.1 有必要占4个字节吗？

- 有必要，4个字节就是32个比特，那么能够代表`2`的`32`次方 种状态
- 如果太小了，回绕的频率就会太高

### 1.2 如果满了怎么办

- 满了是比较困难的，因为有 2的32次方 种组合，差不多就是21亿多种
- 如果满了就开始从0循环，这个步骤称为*回绕*
  [[计算机网络-ISN和回绕问题]]

### 1.3 如何实现，对于每一个字节都“独立编码”？

- 每个段有一个自己的起始字节的编号，那就是`seq`号
- 后面的每个字节，只要通过起始`seq` + 偏移量，就可以实现“字节”和“编码”的一一对应

### 1.4 怎么保证传输的可靠性？

- 包的序列号保证了接收数据的乱序和重复问题 假设我们往 TCP 套接字里写 3000 字节的数据导致 TCP发送了 3 个数据包，每个数据包大小为 1000 字节：第一个包序列号为1 - 1000 ，第二个包序列号为 1001-2000，第三个包序号为 2001~3001
  ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230414190626.png)

- 假如因为网络的原因导致第二个、第三个包先到接收端，第一个包最后才到，接收端也不会因为他们到达的顺序不一致把包弄错，TCP 会根据他们的序号进行重新的排列然后把结果传递给上层应用程序。
- 如果 TCP 接收到重复的数据，可能的原因是超时重传了两次但这个包并没有丢失，接收端会收到两次同样的数据，它能够根据包序号丢弃重复的数据。

## 2. ACK和SYN、FIN

### 2.1 为什么需要预留6个flag位？

- 通信的时候，通过这6个flag位去判断状态
- 比如`syn`，本质上就是判断是否进入*同步*状态

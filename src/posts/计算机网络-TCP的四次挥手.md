---
author: Albert
date: 2024-03-10
date created: 2023-05-09
tags:
  - Blog
  - Network
  - interview
title: 计算机网络-TCP的四次挥手
---

# 计算机网络-TCP的四次挥手

## 1. 四次挥手的过程

![|475](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240310203607.png)

![image.png|500](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230421155336.png)

## 2. 为什么FIN消息自己需要独立占据一个seq号

![image.png|500](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230423154454.png)

- 如果不消耗一个独立的`seq`号，那么，对于之后接受到的`ack`号，就无从判断：**到底是对方收到了之前自己发出的载荷数据，还是FIN消息**

## 3. FIN_WAIT_1 和 FIN_WAIT_2 有什么区别？

1. 什么时候进入`FIN_WAIT_1`状态？

- 客户端发送了自己的`FIN`消息之后，就立刻进入`FIN_WAIT_1`状态，这个状态下，客户端实际上处在一种`半关闭`状态，也就是*客户端保证了自己不会发送消息*，在等待服务端发送**ACK消息**。

1. 什么时候进入`FIN_WAIT_2`状态？

- 客户端收到了服务端发送的`ACK`消息，也就是说，已经明确了*服务端确实已经知道了我想关闭连接了*，那么，此时就会进入`FIN_WAIT_2`状态。
- 这个状态下，客户端依然不具备发送消息的能力，也是一种`半关闭`状态，但是在等待服务端发送**FIN消息**，也就是说，**等待服务端处理完所有的数据，并发送FIN消息，希望结束连接**。

## 3. 为什么第三次挥手和第二次挥手的 `seq` 号可能相同`

![image.png|700](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230423163033.png)

- 上图中，第二次挥手和第三次挥手的`ack`号相同，这是不难理解的，因为二者都是对于第一次挥手（即客户端发起的`FIN`请求的确认）
- 但是为什么二者的`seq`可能相同呢？
- 因为服务端在这个过程当中没有传输数据，因此，第二次挥手和第三次挥手的`seq`是相同的。
- 这会不会造成混乱？
- 不会，因为最后一次客户端的`ACK`确认，本质上是对于上一次的服务端`FIN`消息的确认，可以通过`FIN`位判定实际拿到的消息是否为`FIN`消息。

## 4. 什么时候仅需*三次挥手*？

- 需要满足两个条件：1. 服务端在`CLOSE_WAIT`阶段没有传输数据 2.开启了`TCP`延迟确认机制
- 什么是**延迟确认机制**？
  [[计算机网络-TCP的延迟确认]]

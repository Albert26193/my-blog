---
author: Albert
category: CS-基础
date: 2024-02-22
date created: 2023-05-09
date updated: 2023-04-23 20:28
description: info
link: https://www.notion.so/TCP-8e3dc5fa358d400a90b965c6b41dea49
notionID: 8e3dc5fa-358d-400a-90b9-65c6b41dea49
tags:
  - interview
  - network
title: 计算机网络-TCP连接的三次握手
---
#interview #network 

# 计算机网络-TCP连接的三次握手

## 1. ISN

- 在建立连接之初，通信双方都会各自选择一个序列号，称之为初始序列号。在建立连接时，通信双方通过 SYN 报文交换彼此的 ISN，如下图所示 
![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230414183203.png)

## 2. SYN报文交换

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230414183420.png)

- 其中第 2 步和第 3 步可以合并一起，这就是三次握手的过程
![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230414183449.png)
---
![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230421155336.png)

## 3. 实例

### 3.1 例一

- 同步初始序列号的意义是什么，比如服务端接受了客户端的一个TCP段，TCP头部写着序号 2000。在此前，他们建立了三次握手机制，确定了客户端的ISN是200，那么下面的通信怎么展开？
  - 当客户端发送这个序列号为 2000 的 TCP 段时，服务器会将该序列号与当前预期的序列号进行比较。假设在这之前，服务器已经收到了序列号从 200 到 1999 的数据段，所以下一个预期的序列号为 2000。
  - 服务器成功接收序列号为 2000 的 TCP 段，并将其按序存储。然后，服务器会向客户端发送一个确认（ACK）消息，指示已经成功接收该 TCP 段，并期望收到下一个序列号。假设此 TCP 段的长度为 100 字节，那么 ACK 消息中的确认号（Acknowledge Number）将为 2100（2000 + 100）。
  - 客户端收到服务器的 ACK 消息后，会更新其自己的发送窗口，并根据需要发送后续的数据段。

### 3.2 例二

- 客户端的使用 ISN=2000 打开一个连接，服务器端使用 ISN=3000 打开一个连接，经过 3 次握手建立连接。连接建立起来以后，假定客户端向服务器发送一段数据 Welcome the server!（长度 20 Bytes），而服务器的回答数据 Thank you!（长度 10 Bytes ），试画出三次握手和数据传输阶段报文段序列号、确认号的情况。

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230415004239.png)

```txt
       Client                                                  Server
         |                                                       |
         |----------- SYN(ISN=2000) --------->>>>>>>|            |
         |                                                       |
         |<<<<<<<<<-------- SYN-ACK(ISN=3000, ACK=2001) ----|    |
         |                                                       |
         |----------- ACK(ACK=3001) --------->>>>>>>|            |
         |                                                       |
         |----------- DATA(SEQ=2001, ACK=3001) --------->>>>>|   |
         |                                                       |
         |<<<<<<<<--------- ACK(SEQ=3001, ACK=2021) --------|    |
         |                                                       |
         |----------- DATA(SEQ=3001, ACK=2021) ---->>>>>>>>>|    |
         |                                                       |
         |<<<<<<<<<<<----- ACK(SEQ=2021, ACK=3011) --------|     |
         |                                                       |
```

## 4. 实际抓包过程

- 目标ip地址是`180.101.50.242`
- 实际抓包的过程如下图所示：
![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230423183556.png)
- 过滤规则如下：`(ip.dst == 180.101.50.242 or ip.src == 180.101.50.242)`

### 第一次握手

- 客户端向服务端发起请求
  - 告诉服务端自己的`ISN`，也就是初始序列号
  - 发送给服务端的此条消息中，`Flags`标志位当中的`SYN`bit是`1`，表示这是一条希望二者建立连接的请求。
![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230423184039.png)

- 上图中不难看出：
  - 客户端`ISN`: 1916984173
  - `SYN`比特确实已经设置为`1`

## 第二次握手

- 服务端向客户端发起请求
  - 告诉客户端，自己确实已经收到了来自客户端的请求，凭证就是能说出`ACK`号
  - 告诉客户端，自己的`ISN`，也就是初始序列号
  - 服务端发送的此条消息，其`SYN`比特也是`1`，等于告诉客户端，**我们现在还处在建立连接的阶段**
![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230423184841.png)
- 上图中不难看出
  - 确实已经收到了客户端的`SYN`请求了，凭据就是其`ACK`为 1916984173 + 1（表示在此之前的全部都收到了)
  - 服务端`ISN`为 1650034095
  - `ACK`和`SYN`位置都为1

## 第三次握手

- 客户端告诉服务端，自己已经收到了来自第二次握手的全部信息了，凭证就是其`ACK`号
![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230423185254.png)
- 上图中不难看出，确实已经收到了来自 客户端的 `seq`序列号了

## 5. 双方所处的状态

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230423202827.png)

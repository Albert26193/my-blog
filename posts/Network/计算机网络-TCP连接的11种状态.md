---
author: Albert
date: 2024-02-22
date created: 2023-12-01
date updated: 2023-12-01 15:02
description: info
tags:
  - network
  - interview
title: 计算机网络-TCP连接的11种状态
---
#network #interview 

# 计算机网络-TCP连接的11种状态

## 1. 11种状态参考表

### 1.1 概览

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20231201150026.png)

- 关闭（1种）: `closed`
- 建立过程（3种）：`listen/syn_received/syn_sent`
- 建立（1种）：`established`
- 关闭阶段（6种）：
  - 主动关闭（4种）: `fin_wait1/fin_wait2/closing/time_wait`
  - 被动关闭（2种）：`close_wait/last_ack`

### 1.2 状态转移

![image.png|450](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20231201150232.png)

- 简单来说，可以在状态前面加上一个 `have`，解释就会更加合理，比如 `have syn-sent`，那么，就是描述*主动连接方已经发送了 `SYN` ，进入了 `syn-sent`状态*。

### 1.3 参考表

| State        | Endpoint | Description                                                                    |
|:------------ |:-------- |:------------------------------------------------------------------------------ |
| LISTEN       | 被动方   | 等待来自任何远程TCP端点的连接请求。                                                         |
| SYN-SENT     | 主动方   | 在发送连接请求后，等待匹配的连接请求。（主动方第一次握手之后的状态）                                  |
| SYN-RECEIVED | 被动方   | 在收到和发送连接请求后，正在等待确认的连接请求确认。（被动方第二次握手，发送`ACK + SYN`之后的状态） |
| ESTABLISHED  | 双方     | 一个开放的连接，接收到的数据可以传递给用户。这是连接数据传输阶段的正常状态。                          |
| FIN-WAIT-1   | *主动方*   | 等待来自远程TCP的连接终止请求，或先前发送的连接终止请求的确认。（主动方第一次挥手，发送了`FIN`,在等被动方发送 `ACK` 确认）        |
| FIN-WAIT-2   | *主动方*   | 等待来自远程TCP的连接终止请求。（主动方已经收到了被动方发送的`ACK`号，在等待被动方发送的`FIN`号）                                   |
| CLOSE-WAIT   | 被动方   | 等待本地用户发送连接终止请求。（被动方接收到了主动方发送的`FIN`号，会立刻发送`ACK`,但是*它仍然需要一段时间来处理自己的事情*，`close-wait`就是用来干这个的）                              |
| CLOSING      | 被动方   | 正在等待来自远程TCP的连接终止请求确认。(*实际上是比较少见的，用来应对双方几乎同时关闭连接的场景*)                 |
| LAST-ACK     | 被动方   | 等待之前发送给远程TCP的连接终止请求的确认（其中包括对其连接终止请求的确认）。（被动方在发送了`FIN`报文之后，等待主动断开方发送 `ACK`确认的过程，实际上就是最靠近`Closed`的一种状态）       |
| TIME_WAIT    | *主动方*   | 等待足够的时间，以确保连接上的所有剩余数据包都已过期。（主动断开方在收到了*最后一次`ACK`号*之后，也就是四次挥手全部结束之后，还要等一段时间，确保**迷路的包全部死掉**）          |
| CLOSED       | 双方     | 关闭                                                                       |

![image.png|425](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20231201153338.png)

## 2. `TCP` 如何设置状态

- 通过  `Linux` 内部的网络协议栈进行管理，它保证了 `TCP` 连接在指定的 `11种` 状态当中相互转化。

## 3. 程序员应该如何查看状态

- `ss` 命令可以查看全连接队列的状态
- `netstat` 配合 `grep` 可以查看其他状态
- `ss -no state time-wait`
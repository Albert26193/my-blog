---
author: Albert
date: 2024-02-22
date created: 2023-10-18
tags:
  - Blog
  - interview
  - Network
title: 计算机网络-为什么我们需要RPC
---

# 计算机网络-为什么我们需要RPC

> 建议参考文章：
> https://www.zhihu.com/question/524580708/answer/2584782720

## 1. `RPC` 的出现

- `RPC` 的兴起，背后的本质是微服务的兴起。
- 所谓微服务，就是将负责的业务逻辑进行解耦，每个业务逻辑背后对应着一个线程。
- 微服务之间不可避免*需要通信*，它们的通信，本质上是*线程间通信*。线程间通信实际上有很多个办法可以实现：
  1. 管道
  2. 信号量
  3. 共享内存...
  4. Socket
- 虽然有这么多种通信方式，但是实际上，`Socket`几乎是**唯一的选择**。因为现代的微服务开发往往依赖于多机分布式系统，它们的通信依赖于 `Socket`。

---

- 但是，如果仅仅基于 `Socket` 或者 `TCP` 进行实现，会存在非常多的问题。以最简单的，某个本地程序*cat*，调用远程服务*dog* 举例，其繁琐的通信过程如下所示：
  1. 本地程序 _cat_ 发送 `connct` 请求，希望能够连接 _dog_ 服务器
  2. 连接成功之后，_cat_ 制造了一些数据包，包里面有着具体调用的方法，比如 _wang wang_ 方法，和具体的参数 _count = 3_（希望 _dog_ 汪汪叫3次）
  3. _cat_ 发送这个数据包
  4. _dog_ 收到数据包，然后解析出来 _wang wang_ 方法 和 相关参数 _count = 3_
  5. _dog_ 执行了 _wang wang_ 方法，将结果封装起来
  6. 再将数据包发送回 _cat_，调用结束。
- 可见，这个流程比较繁琐，**开发者更加希望能够*像调用本地方法一样调用远程方法***。

---

- 在理想的情况下，调用的伪代码如下所示：

```txt
func wang wang () {
  connect "REMOTE_DOG_SERVER"
  encode PACKAGE(i want to call 'wang wang', count = 3)
  send
  recevie PACKAGE

  finish
}
```

- 那么，对于本地的 _cat_ 来说，其调用 _wang wang_ 方法就像在本地调用一样（有点类似于远程方法在本地的映射）

## 2. `RPC` 的实现原理

- 对于设计者来说，`Remote Process Call(RPC)` 应该是简单且稳定的。
- 开发者不必关心背后的*网络细节*，只管去调用方法即可。那么，`RPC` 应该向底层屏蔽细节，或者说，**从TCP字节流到具体对象的转化，应该放在 `RPC`这一层去完成**。

### 2.1 `protobuf` 序列化方案

- 为了完成这一需要，`Google` 提出了 `protobuf` 序列化方案，这个方案可以将*对象* 转成*字节流*。转化过程就是序列化。这个过程的逆过程就是所谓 _反序列化_。
- 那么，如果本地的 _cat_ 想要 _wang wang_ 叫，那么其 `protobuf` 文件， 如下所示，实际执行的时候，需要按照文件当中的规约进行转化即可。

```txt
message WangWangReq {
  string data
}

message WangWangRes {
  int32 sound;
  int32 loud;
  int32 time;
}
```

### 2.2 `RPC` 处理包的策略

- 理想化的情况下，开发者只要在本地调用一次 `RPC` 请求，然后完整的结果就会返回到本地，成功完成解析（类似 `Restful API` 的 `get` 请求）
- 但是实际上，`RPC` 的底层支撑如果是面向字节流的 `TCP` 协议，那么不可避免需要面对 **TCP粘包问题**。[[../../../传输层/TCP/计算机网络-TCP黏包和拆包|计算机网络-TCP黏包和拆包]]
- 因此，作为应用层协议，`RPC` 使用者需要设计一套策略，解决拆包问题

---

- 一个简单的设计如下所示，参考自: https://www.cnblogs.com/solstice/

```cpp
char* start;    // 0x02    // 数据包开始
int32_t pk_len;            // 整个数据包长度
int32_t service_full_name_len;   // 方法名的长度
std::string service_full_name;   // 方法名
pb binary data;                  // 序列化之后的二进制数据
int32_t checksum;                // 校验和（完整性认真）
char* end;      // 0x03   // 数据包结束
```

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20231018161822.png)

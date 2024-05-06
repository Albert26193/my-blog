---
author: Albert
date: 2024-02-22
date created: 2023-05-09
tags:
  - Blog
  - Network
  - interview
title: 计算机网络-MTU和MSS
---

# 计算机网络-MTU和MSS

## 1. MTU是哪一层上面的概念

- `MTU`: `Max Transport Unit`
- 主要和`MAC`层相关，但是不止和`MAC`层相关
- 不同的链路层上面的`MTU`是不同的
- 物理层也会限制`MTU`的大小
- **IP层支持的最大的报文**大小：65535，相当于2的16次方，因为在IP头部，是通过一个16位二进制数去表示的。所以从*ip层到mac层的时候，需要把报文拆开*
  ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230516153632.png)

## 2. `lo0`的MTU为什么这么大？

- `lo0`：`loopback interface` 是用来本地回环的接口
- 因此不受物理层的限制，所以`MTU`可以开得大一点
- 如下图所示：
  ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230516153133.png)

## 3. `IP`层是如何把包切开的？

- 所谓把包切开，就是`MAC`层可以*一段一段地*去传输
- `MAC层`按照什么作为*一段一段*的分界标准？
- **长度 + 偏移量**写在的`ip package`的头部，按照这两个参数就可以正确拆分
- 如下图所示：
  ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230516155132.png)
  ![](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230516155132.png)

---

> 在 MTU=1500 字节的以太网中，TCP 报文的最大载荷为多少字节?
> 1460(最大载荷) = 1500(MTU)- 20(IP头) - 20(TCP头)

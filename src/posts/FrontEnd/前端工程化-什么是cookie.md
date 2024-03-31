---
author: Albert
date: 2024-02-22
date created: 2023-05-09
date updated: 2023-06-06 15:03
description: info
tags:
  - Blog
  - front-end
  - network
title: 前端工程化-什么是cookie
---

# 前端工程化-什么是cookie

## 1. 为什么需要cookie

- `cookie`的出现是为了解决`http连接`*无状态*的问题
- `cookie`里面可以存储的东西很多，比如用户的偏好设置，等等
- 运营商可以基于`cookie`进行广告的推送，收集用户的隐私数据等等。

## 2. cookie工作原理

- `cookie`是一种小型文本文件，首先在服务端产生
- 用户访问网站的时候，服务端会发送一个包含`cookie`的`http`响应
- 客户端会把`cookie`存储在本地
- 以后的每一次重新访问，`cookie`都会发送回服务端，服务端用它来做身份辨认
- 最新的RFC规范：`RFC6265`
- 通过键值对的形式存放`cookie`
- 大小一般在`4k`左右

![image.png|500](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230606144720.png)

---

1. `cookie`是怎么产生的？

- *服务器*产生的，用来记录客户端的信息

2. `cookie`放在哪里？

- 放在*客户端*，需要频繁和服务端通信

## 3. cookie组成部分

```lua
name: 名称
value：cookie的值
domain: 可以使用此cookie的域名
path: 可以使用此cookie的页面路径
expire: cookie的超时时间
secure: 是否只能通过https来传递这条cookie
```

## 4. cookie 的功能特点

https://cshihong.github.io/2019/06/19/HTTP%E5%8D%8F%E8%AE%AE%E5%88%86%E6%9E%90/

![image.png|450](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230606145042.png)

---

- 实际拿到的cookie如下所示：
  ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230606145338.png)

- 通过 `[name, domain, path]` 唯一确定一条 `cookie`
- 怎么理解 ”写时带属性，读时无属性“？
  - 写：服务端往客户端写数据，需要给出种种描述性质的属性，客户端才能明白服务端具体做了什么设置。比如：`Set-Cookie: sessionId=12345; Domain=example.com; Path=/; Expires=Wed, 21 Oct 2021 07:28:00 GMT; Secure; HttpOnly`等等。
  - 读：服务端只需要知道一件事情——**”你（服务端）是谁“** ，因此仅仅需要发送`cookie`的值和名称即可。`Cookie: sessionId=12345`
  - 这么做的好处是什么？减少请求头的大小，从而降低网络的开销。

---

> [!attention]
> 注意：如果是JWT鉴权，这么做显然就不合适了，客户端仅仅发送Session ID回去是不行的，需要通过JWT token判断**你是谁**。

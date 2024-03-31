---
author: Albert
date: 2024-02-23
date created: 2023-05-09
date updated: 2023-04-26 17:52
description: info
tags:
  - Blog
  - network
  - interview
title: 计算机网络-TCP拥塞控制Reno算法
---

# 计算机网络-TCP拥塞控制Reno算法

> [!tip]
> cite: [4.2 TCP 重传、滑动窗口、流量控制、拥塞控制 | 小林coding](https://xiaolincoding.com/network/3_tcp/tcp_feature.html#%E6%85%A2%E5%90%AF%E5%8A%A8)

## 1. 概览

![image.png|500](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240223002853.png)

- 所谓的拥塞控制，本质上就是**避免发送方的数量填满整个滑动窗口**。
  - 慢启动（防止拥塞）
  - 拥塞避免
  - 拥塞发生（快重传）
  - 快速恢复

## 2. 慢启动

- 简单说，就是在开始发送的阶段，从最低值开始，一点点慢慢增大窗口数量。
- 当发送方每收到一个 `ACK`，拥塞窗口 `cwnd` 的大小就会扩大一次 。
- **慢启动的开始阶段并不慢，一开始是指数级别上升**，到达 `ssthresh` 慢启动门限的时候，速度才开始放缓，从指数上升到慢速上升。

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240223000328.png)

- 慢启动门限 `ssthresh` （`slow start threshold`）状态变量。
- 当 `cwnd` < `ssthresh` 时，使用慢启动算法。
- 当 `cwnd` >= `ssthresh` 时，就会使用「拥塞避免算法」。

## 3. 拥塞避免算法

- 一般来说 `ssthresh` 的大小是 `65535` 字节。
- 当拥塞窗口 `cwnd` 超过慢启动门限 `ssthresh` 就会进入拥塞避免算法。
- **每当收到一个 `ACK` 时，`cwnd` 增加 `1/cwnd`。** 使得 `cwnd` 变成慢速增长。
- 归根结底，就是想办法把滑动窗口增长变慢。

![image.png|500](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240223000819.png)

## 4. 拥塞发生

### 4.1 如果发生超时重传

![image.png|500](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240223001528.png)

- `ssthresh` 设为 `cwnd/2`，
- `cwnd` 重置为 `1` （是恢复为 `cwnd` 初始化值，这里假定 cwnd 初始化值 1）

> 实际上 `Linux` 对于 `cwnd` 窗口大小的设置默认为 `10`， 通过 `ss -nli` 命令可以看出

### 4.2 如果发生快速重传

- 触发快速重传，说明网络环境还行，没有那么糟糕，可以不采取极限的办法。
- `cwnd` = `cwnd/2` ，也就是设置为原来的一半;
- `ssthresh` = `cwnd`;
- 进入**快速恢复算法**

## 5. 快速恢复

- 快速重传和快速恢复往往一起使用，大概的意思就是说，**你还能收到三个重复的 `ACK`，说明情况不是太差，可以尝试快速恢复 `cwnd` 大小**。
- 进入快速恢复之前，`cwnd` 和 `ssthresh` 已被更新了：
- `cwnd` = `cwnd/2` ，也就是设置为原来的一半;
- `ssthresh` = `cwnd`;

---

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240223002018.png)

- 然后，进入快速恢复算法如下：
- 拥塞窗口 `cwnd` = `ssthresh` + `3` （ `3` 的意思是确认有 `3` 个数据包被收到了）；
- 重传丢失的数据包；
- 如果再收到重复的 `ACK`，那么 `cwnd` 增加 `1`；
- 如果收到新数据的 `ACK` 后，把 `cwnd` 设置为第一步中的 `ssthresh` 的值，原因是该 `ACK` 确认了新的数据，说明从 `duplicated ACK` 时的数据都已收到，该恢复过程已经结束，可以回到恢复之前的状态了，也即再次进入拥塞避免状态；

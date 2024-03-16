---
author: Albert
date: 2024-02-24
date created: 2024-02-19
date updated: 2024-02-19 12:44
tags:
  - Blog
  - DB
  - interview
title: 数据库-BufferPool的原理
---

# 数据库-BufferPool的原理

## 1. 为什么需要 `BufferPool`

- `MySQL` 数据是存放在磁盘当中的，但是不能每次都从磁盘当中直接取数据，那样的速度比较差。
- 直观的做法就是将高频访问的数据找个地方放置起来，便于快速读取，那么，就需要**设置一个在内存当中的缓冲区，这个缓冲区就是 `BufferPool`**。
- 除了读以外，`BufferPool` 对写操作也有优化，修改数据的时候，先修改 `BufferPool` 当中的页，然后将其设置成*脏页*，最后通过后台线程将其同步到磁盘当中。（这么做的目的就是为了减少磁盘 `IO`）

## 2. `BufferPool` 的具体设计

### 2.1 空间结构

- 大小默认为 `128MB`，可以通过参数进行手动调整。
- 缓存的时候，不会细颗粒度地针对*记录*去做缓存，而是将该记录所在的 _页_ 一起放到 `BufferPool` 当中，这里的 _页_，就是 `InnoDB` 引擎存储、管理数据的基本单元，默认 `16KB` 的 `Page`。
- 其空间结构大概如下图所示：

![image.png|500](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240224165420.png)

- 除了缓存“索引页”和“数据页”，还包括了一切其他的信息，什么自适应哈希索引，锁信息等等。

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240224165459.png)

### 2.2 页管理策略

`Innodb` 通过三种链表来管理缓页：

- `Free List` （空闲页链表），管理空闲页；
- `Flush List` （脏页链表），管理脏页；
- `LRU List`，管理脏页+干净页，将最近且经常查询的数据缓存在其中，而不常查询的数据就淘汰出去。；

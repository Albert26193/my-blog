---
author: Albert
date: 2024-02-24
date created: 2024-02-24
tags:
  - Blog
  - DB
title: SQL-常见日志
---

# SQL-常见日志

> [!info] >[MySQL 日志：undo log、redo log、binlog 有什么用？ | 小林coding](https://www.xiaolincoding.com/mysql/log/how_update.html#%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81-undo-log)

## 1. `undo log`

![image.png|302](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240224164222.png)

- `undo log` 被称为回滚日志，**事务的原子性就是通过 `undo log` 进行保证的**。
- 如果数据库的 `autocommit` 参数设置开启的话，**执行增删改**等操作的时候，实际上自动提交事务。
- 在事务正在执行，还没有提交，`MySQL` 发生了崩溃，那么需要设置一种机制，**及时回滚事务之前的数据**。
- 这个机制就是通过 `undo log` 来保证的，事务没有提交的时候，`MySQL` 会记录更新之前的数据到 `undo log` 日志文件里面。所谓回滚，就是根据日志恢复之前的状态。

## 2. `redo log`

- `BufferPool` 实现了一种预写技术，大概的逻辑就是，每次写入的时候，实际上只是修改了 `BufferPool` 当中的内容（也就是将所谓的页标记成脏页），这个过程不发生磁盘 `IO`，用户的感知就是速度很快。
- 然后，在 `BufferPool` 比较空闲的时候（或者 `redo log` 满了 or `BufferPool` 空间不足，需要换出数据的时候，总之，就是合适的时机），将后台线程将数据写入磁盘（这一步发生磁盘 `IO`，但是用户感知不出来）。
- 上述过程存在一个较大的短板，_如果中间过程断电宕机，内存当中的所有消息都会失效_。为了防止这种问题，需要一种同步策略，_把发生的过程以低成本的方式记录下来_，这个操作，就是所谓的 `redo log`。
- 在写入 `BufferPool` 的过程当中，`redo log` 会同步记录操作，并及时更新。

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240224170739.png)

---

- 上面说道，实现记录的方式必须是*低成本*的，因为如果高成本，磁盘 `IO` 的代价很大，那么和直接写入到磁盘当中就没有区别了。_低成本如何体现呢？，`redo log` 写入磁盘的方式是追加写。_ 追加写利用了机械硬盘磁头扫描的特性，能够降低写的延迟。
- 此外，`redo log` 也不是直接写入磁盘的， 也有一个 `redo log buffer`，默认为 `16MB`，每次写入的时候，日志也是先写入缓存，然后集中起来写入磁盘。

---

- `redo log` 也有自己的刷新机制，这一点和 `Redis` 的 `AOF` 持久化的重写有点类似，既然 `redo log` 是对于操作的记录，那么，只有最新的操作也是有意义的，旧的操作应该通过一定的策略淘汰掉。
- `MySQL` 设计了一种类似于循环链表那样的结构，能够擦除旧的，不用的信息。

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20240224171402.png)

## 3. `bin log`

- `binlog` 是 MySQL 的 `Server` 层实现的日志，所有存储引擎都可以使用；
- `redo log` 是 `Innodb` 存储引擎实现的日志；
- `bin log` 常用于主从复制

---

- 主从复制是指将 主数据库（`Master`）中的 `DDL` 和 `DML` 操作通过二进制日志传输到 从数据库（`Slave`） 上，然后将这些日志重新执行（重做），从而使得从数据库的数据与主数据库保持一致。MySQL 支持单向、异步复制，复制过程中一个服务器充当主服务器，而一个或多个其它服务器充当从服务器。

---

- 其原理大概如下
- `Master` 端：打开二进制日志（`binlog` ）记录功能 —— 记录下所有改变了数据库数据的语句，放进 `Master` 的 `binlog` 中；
- `Slave` 端：开启一个 I/O 线程 —— 负责从 `Master` 上拉取 `binlog` 内容，放进自己的中继日志（`Relay log`）中；
- `Slave` 端：SQL 执行线程 —— 读取 `Relay log`，并顺序执行该日志中的 `SQL` 事件。

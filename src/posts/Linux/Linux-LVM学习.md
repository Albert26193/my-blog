---
author: Albert
date: 2024-02-22
date created: 2023-07-19
description: Linux基本常识
tags:
  - Blog
  - Linux
title: Linux-LVM 学习
---

# Linux-LVM 学习

## 1. LVM 是什么

1. LVM 的大概工作流程？
   ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230718191302.png)

> - 把物理卷拼接起来，变成逻辑卷组
> - 划分逻辑卷组，变成多个逻辑分区

---

2. 既然已经是一个逻辑盘了，那么我的 /home /var /tmp /swap 等等目录，还有必要分挂载点吗？

> `LVM` 把多个物理盘拼成一个逻辑盘之后，实际上还需要完成逻辑分区的划分，_特定的挂载点如果填满了逻辑分区，那么其大小就不会进一步膨胀_。此外，从备份的角度来说，其实也是需要划分的。

---

3. 如何实现动态扩容？
4. 如果有一块 SSD，一块 HDD，`LVM` 将其拼接在一起，我还怎么分得清当前挂载点的物理介质究竟是什么？
5. 同一个逻辑卷上面可以挂载多个不同的文件系统吗？应该不可以？

## 2.前置知识：`fdisk`

- 请参考：[[Linux-关于fdisk命令]]

## 3. 操作流程

> 前置操作： 利用 `fdisk` 改变磁盘分区类型为 `Linux LVM`

### 3.1 创建物理卷 (PV)

- 物理卷 (PV) 这个概念 **只从属于 LVM 体系**，为了放置混淆，我们称初始的磁盘设备为 _物理磁盘_
- 为了便于 `LVM` 的操作，需要下载工具包 `apt-get install lvm2`
- `pvcreate` 命令可以用来创建 `PV`

![](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230719210544.png)

- 可以看到，旧的文件系统会被覆盖掉，比如 `/dev/sdc3` 对应的 `ext4` 文件系统

---

- 利用 `pvdisplay` 查看一下
  ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230719210752.png)

- `pvremove /dev/sdxxx` 可以删除物理卷

### 3.2 将多个物理卷 (PV) 拼合成卷组 (VG)

- 为了体现 `LVM` 的优势，实验将 `/dev/sdd` 也就是另外的一个物理磁盘，划分成 `/dev/sdd1` 和 `/dev/sdd2` 两个 `PV`，然后将其拼接起来
- 思路如下图：
  ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230719213752.png)
- `dev/sdc1 + /dev/sdd1 = volume_group1`
- `/dev/sdc2 + /dev/sdc3 + /dev/sdd2  == volume_group2`

---

- 操作如下

```sh
# create
$ sudo vgcreate volume_group1 /dev/sdc1 /dev/sdd1
  Volume group "volume_group1" successfully created

$ sudo vgs    #简略版的 vgdisplay
  VG            #PV #LV #SN Attr   VSize VFree
  volume_group1   2   0   0 wz--n- 2.99g 2.99g

# dipslay
$ sudo vgdisplay
  --- Volume group ---
  VG Name               volume_group1
  System ID
  Format                lvm2
  Metadata Areas        2
  Metadata Sequence No  1
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                0
  Open LV               0
  Max PV                0
  Cur PV                2
  Act PV                2
  VG Size               2.99 GiB
  PE Size               4.00 MiB
  Total PE              766
  Alloc PE / Size       0 / 0
  Free  PE / Size       766 / 2.99 GiB
  VG UUID               ufUx74-h8nP-5UWn-Za8m-h3rT-a8MY-wU0jf3

```

- `vgcreate` ：创建
- `vgdisplay`： 显式
- `vgs`: 粗略显式
- `vgremove`：删除逻辑卷

### 3.3 将卷组划分成逻辑卷 (LV)

```sh
sudo lvcreate -L 100M -n my_lv_1 volume_group1
```

- `-L` 指定大小
- `-n` 指定名称

---

- 利用 `vgs` 和 `lvs` 可以便捷查看
- `lsblk` 也会列出树形结构，便于查看
  ![image.png|500](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230719221733.png)

---

- 可以看到，优先使用了 `/dev/sdc1` 上面的空间
- 如果划分一个很大的 `LV` 逻辑卷，如下所示

```sh
 sudo lvcreate -L 2.2G  -n my_lv_2 volume_group1
```

![image.png|500](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230719222131.png)

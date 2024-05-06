---
author: Albert
date: 2024-02-22
date created: 2023-07-21
tags:
  - Blog
  - Linux
  - 备忘录
title: Linux-LVM 实践
---

# Linux-LVM 实践

## 1. 场景

- 远程服务器安装盘不合理，其挂载方式如下图所示：
  ![image.png|475](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230729194554.png)

- `/` 目录的挂载点空间过大，只有两个 `500G` 的硬盘可以挂载 `/home` 目录
- 希望将两个独立的 `500G` 的物理磁盘合并成一个 `vg`（卷组），然后划分全部空间作为`lv`（逻辑卷），用以挂载 `/home`。

## 2. 操作

### 2.1 修改磁盘分区类型为 `Linux LVM`

- `fdisk /dev/sda`
- `n` 建立分区
- `t` 修改分区类型
- `8E` `Linux LVM type`
  ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230729195849.png)
- `/dev/sdb` 可以进行同理操作，修改其磁盘分区类型

### 2.2 制作两个 `pv`（物理卷）

- [[Linux-LVM学习]]
- [[Linux-关于fdisk命令]]

---

- `pvcreate /dev/sdxxx` 创建逻辑卷

```sh
#root@debian-24-20:~
pvcreate /dev/sda1
# Physical volume "/dev/sda1" successfully created.

#root@debian-24-20:~
pvcreate /dev/sdc1
#Physical volume "/dev/sdc1" successfully created.
```

---

- 查看对应的逻辑卷状态
  - `pvs` 简略版，类似树形结构给予呈现
  - `pvdisplay` 详细版，详细打印

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230729200454.png)

### 2.2 将两个 `pv` 合并成一个`vg`（卷组）

```bash
vgcreate volume-group-1 /dev/sda1 /dev/sdc1
```

- 创建 `vg`，名称是 `volume-group-1`
- `vgs` 或者 `vgdisplay` 来查看

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230729200800.png)

### 2.3 基于 `vg` 创建 `lv` 逻辑卷

```sh
 lvcreate -L 999G -n for_home volume-group-1
```

- `lvcreate` 创建逻辑卷
- `-L` 指定大小为 `999G`
- `-n` 指定名称为 `for_home`
- `volume-group-1`

---

- `lvs` 或者 `lvdisplay` 展示
  ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230729203246.png)

---

- `mkfs.ext4` 格式化分区

```sh
mkfs.ext4 /dev/volume-group-1/for_home
```

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230729203552.png)

### 2.4 将 `vg`（卷组）挂载到 `/home` 目录

#### 2.4.1 创建 `/home_move` 目录用来放置原有 `/home` 内容

```sh
mkdir /home_move
```

#### 2.4.2 挂载 `/home_move` 目录到逻辑卷上

- 执行挂载

```sh
root@debian-24-20:/ mount /dev/volume-group-1/for_home /home_move
```

- 结果

```sh
root@debian-24-20:/ lsblk
NAME                          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda                             8:0    0  500G  0 disk
└─sda1                          8:1    0  500G  0 part
  └─volume--group--1-for_home 254:0    0  999G  0 lvm  /home_move
sdb                             8:16   0  1.2T  0 disk
├─sdb1                          8:17   0  512M  0 part /boot/efi
├─sdb2                          8:18   0  1.2T  0 part /
└─sdb3                          8:19   0  976M  0 part [SWAP]
sdc                             8:32   0  500G  0 disk
└─sdc1                          8:33   0  500G  0 part
  └─volume--group--1-for_home 254:0    0  999G  0 lvm  /home_move
sr0                            11:0    1 1024M  0 rom

```

#### 2.4.3 利用 `rsync` 命令将 `/home` 目录内容拷贝至 `/home_move` 下

```sh
 rsync -aXS /home/. /home_move/.
```

- `-a` 归档模式，保持文件属性
- `-X` 保持文件系统的特殊属性，比如链接之类的
- `-S` 优化文件传输，跳过已经存在的文件

---

- 这一步相当于将 `/home_move` 内容写入挂载点对应的逻辑卷当中
- 实现了类似拷贝的功能

#### 2.4.4 卸载 `/home_move` 挂载点，重新挂载 `/home` 目录

- 卸载

```sh
umount /dev/volume-group-1/for_home
```

- 挂载

```sh
mount /dev/volume-group-1/for_home /home
```

#### 2.4.5 修改 `fstab`

- **务必注意 fstab 的加载顺序，上面的文本优先加载，如果出错系统启动会失败**
- 通过 `blkid` 获取文件的 `uuid`

```sh
root@debian-24-20:/ blkid

/dev/sdb2: UUID="169d0736-6876-411f-90f0-dbbb50bafe74" BLOCK_SIZE="4096" TYPE="ext4" PARTUUID="91a9be0c-0292-45f8-9fe2-e3817ef43c83"
/dev/sdb3: UUID="8be81778-f4c2-477c-82f6-03d8c587db7e" TYPE="swap" PARTUUID="50e9b0b8-4dc6-416d-9deb-65e482e97825"
/dev/sdb1: UUID="4E75-E7C9" BLOCK_SIZE="512" TYPE="vfat" PARTUUID="5f53484a-f7df-45aa-8705-643af106a38b"
/dev/mapper/volume--group--1-for_home: UUID="5c17f53c-3b71-4006-bc95-ae3955672248" BLOCK_SIZE="4096" TYPE="ext4"
/dev/sdc1: UUID="GUBFQB-ncwQ-WdmG-pTld-z8nh-MWoA-oCplQY" TYPE="LVM2_member" PARTUUID="ca10e2e9-8a5a-c645-a54a-ec8a42b3738d"
/dev/sda1: UUID="sTHyHw-NYIp-oqmJ-LwCB-LO4b-Wa8d-TohPjR" TYPE="LVM2_member" PARTUUID="79218507-01"

```

---

- 查看之前的 fstab

```sh
# /etc/fstab
root@debian-24-20:/ cat /etc/fstab
# / was on /dev/sdc2 during installation
UUID=169d0736-6876-411f-90f0-dbbb50bafe74 /               ext4    errors=remount-ro 0       1
# /boot/efi was on /dev/sdc1 during installation
UUID=4E75-E7C9  /boot/efi       vfat    umask=0077      0       1
# swap was on /dev/sdc3 during installation
UUID=8be81778-f4c2-477c-82f6-03d8c587db7e none            swap    sw              0       0
/dev/sr0        /media/cdrom0   udf,iso9660 user,noauto     0       0
root@debian-24-20:/#

```

---

- 修改之后的 fstab

```sh
root@debian-24-20:/ cat /etc/fstab
# / was on /dev/sdc2 during installation
UUID=169d0736-6876-411f-90f0-dbbb50bafe74 /               ext4    errors=remount-ro 0       1
# /boot/efi was on /dev/sdc1 during installation
UUID=4E75-E7C9  /boot/efi       vfat    umask=0077      0       1
# swap was on /dev/sdc3 during installation
UUID=8be81778-f4c2-477c-82f6-03d8c587db7e none            swap    sw              0       0
# /home
UUID=5c17f53c-3b71-4006-bc95-ae3955672248 /home           ext4    nodev,nosuid  0       1
/dev/sr0        /media/cdrom0   udf,iso9660 user,noauto     0       0
```

---

- 将 `/home` 对应的硬件先卸载掉，后面重新挂载，用来查看 `fstab` 是否成功加载
- 卸载

```sh
root@debian-24-20:/ umount /dev/volume-group-1/for_home
root@debian-24-20:/ lsblk
NAME                          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda                             8:0    0  500G  0 disk
└─sda1                          8:1    0  500G  0 part
  └─volume--group--1-for_home 254:0    0  999G  0 lvm
sdb                             8:16   0  1.2T  0 disk
├─sdb1                          8:17   0  512M  0 part /boot/efi
├─sdb2                          8:18   0  1.2T  0 part /
└─sdb3                          8:19   0  976M  0 part [SWAP]
sdc                             8:32   0  500G  0 disk
└─sdc1                          8:33   0  500G  0 part
  └─volume--group--1-for_home 254:0    0  999G  0 lvm
sr0                            11:0    1 1024M  0 rom

```

- 重新加载文件系统命令，判断是否重新加载

```sh
mount -a
# 该命令会识别 /etc/fstab 重新挂载对应文件
```

- 结果，证明重新加载上了

```sh
root@debian-24-20:/ mount -a
root@debian-24-20:/ lsblk
NAME                          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda                             8:0    0  500G  0 disk
└─sda1                          8:1    0  500G  0 part
  └─volume--group--1-for_home 254:0    0  999G  0 lvm  /home
sdb                             8:16   0  1.2T  0 disk
├─sdb1                          8:17   0  512M  0 part /boot/efi
├─sdb2                          8:18   0  1.2T  0 part /
└─sdb3                          8:19   0  976M  0 part [SWAP]
sdc                             8:32   0  500G  0 disk
└─sdc1                          8:33   0  500G  0 part
  └─volume--group--1-for_home 254:0    0  999G  0 lvm  /home
sr0                            11:0    1 1024M  0 rom

```

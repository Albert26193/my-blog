---
author: Albert
date: 2024-02-22
date created: 2023-05-09
date updated: 2023-02-07 14:16
description: Linux基本常识
link: https://www.notion.so/Linux-inode-fe5ea5d9e0f347aab744d13755c95279
notionID: fe5ea5d9-e0f3-47aa-b744-d13755c95279
tags:
  - Linux
title: Linux-inode是什么
---

# Linux-inode是什么

## 1. inode是什么？

- `inode`是`Linux`系统当中，文件对应的“身份证号”
- `inode`是系统辨认文件的标识，从文件创建开始，终身唯一，不可修改。
- 在`Linux`系统当中，每个文件都必须有唯一的`inode`号用以辨识身份信息。
- `inode`当中包含对于文件创建时间等等的一系列信息

## 2. 为什么需要inode？

- 系统需要用一个`uuid`类似的设计去标识每一个文件，实现偏平化的控制
- 利用`inode`实现软硬链接
- 系统如果想要删除一个文件，直接删除其`inode`号即可。
- 如果用户移动文件，那么系统会更新`inode`内部信息，但是`inode`号始终不变（搬家的话身份证号也是不变的）
- 系统如果想要更新软件，那么可以通过`inode`号识别到正在运行的二进制文件，然后产生一个新的`inode`，文件名和旧的文件保持一致。那么就不会影响到正在运行的文件。等旧文件运行终止，系统回收旧文件的`inode`号，实现热更新。

## 3. Linux关于inode的设计

### 3.1 物理层面的设计

- 硬盘存储的最小单位（原子单位），称为扇区*sector*，一般是0.5KB
- 操作系统读取硬盘的时候，一般*8*个sector一起读，称为`block`，这是*文件存取的最小单位*
- 文件源数据存在在`block`当中，但是还是需要另外一个东西去存放文件的原始信息（谁建的，操作权限是什么，上次修改是什么时间，文件有多大，有多少个链接指向文件的inode等等）
- 硬盘?一般分成两个区，一个专门放`inode`信息（一般256KB或者128KB一条），另外的区域专门放源数据。
- 在格式化的时候，`inode`号码的总量就确定下来了（那是肯定的，因为需要划分`inode`区域的大小
- 存在一种情况，硬盘没有满，但是`inode`号已经用光了，那样文件也没办法存进去了。
- `df -i`查看硬盘的`inode`分配情况
![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230207140131.png)
---

### 3.2 目录的设计

![image.png|500](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230207140943.png)
- 目录（directory）通过多个目录项（dirent）构成
- dirent = 子文件文件名 + 子文件`inode`号
- `ls -i .`列出当前目录下的文件`inode`分配情况
![image.png|550](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230207141220.png)

---

### 3.3 inode 数据结构的设计

- 文件的字节数
  - 文件拥有者的User ID
  - 文件的Group ID
  - 文件的读、写、执行权限
  - 文件的时间戳，共有三个：ctime指inode上一次变动的时间，mtime指文件内容上一次变动的时间，atime指文件上一次打开的时间。
  - 文件数据block的位置

- 利用`stat`查看文件的`inode`信息
![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230207141259.png)

## 4. inode和软硬连接

- 软链接：
  - 相当于一个全新的文件，只不过这个文件里面的`block`，存放的是指向另外一个文件的`inode`的链接（类似于快捷方式）
  - soft link 就是 symbolic link
  - 软链接对于它指向的文件其实是有依赖关系的

-  硬链接：
  - 在源文件的`inode`块上面，重新添加一个链接（源文件`inode`链接数 + 1）
  - 类似于源文件的“马甲”，“别名”，比如大名叫王大毛，小名叫王狗子，其实是同一个人（同一个`inode`块，也是同一个block）
  - 如果`inode`链接数为`0`，那么系统就会回收文件的物理存储`block`，等于删除了文件
  
![image.png|650](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230207134641.png)


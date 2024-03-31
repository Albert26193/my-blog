---
author: Albert
date: 2024-02-22
date created: 2023-05-09
date updated: 2023-02-09 18:42
description: Git使用常识
tags:
  - Git
title: Git-revert和reset
---

# Git-revert和reset

## 1. git reset

### 1.1 设计目的

- 用以重设本地的更改，可以实现本地状态的回退
- 比如`git reset --hard <hash-commit>`可以实现对某一个提交哈希状态的回退。回退之后，分支上在此之后的所有`commit`都会丢失（可以通过`git reflog`进行找回）
- 关于参数，请参考[[Git-reset当中的soft、hard、mixed]] 

### 1.2 实际使用

- `git reset HEAD` ?
  - 重写`staging area`里面的目录树，被`master`所指向的目录树进行替换，但是`work space`不受影响。
  - 就是把版本回退到`HEAD`所指向的状态。
  - 可以用来**清空`staging area`暂存的内容**

- 另外一个场景，比如只有一个本地分支，然后需要回退状态，此时就可以利用`git reset`进行操作。
![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230209160508.png)

## 2. git revert

### 2.1 设计目的

- 用以撤销*已经push到远程多人仓库的commit*
- 利用全新的`commit`来取代指定的`commit`，`HEAD`状态依然往后走
 ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230209161035.png)

### 2.2 实际使用

- 如果`git revert`两次，那么相当于多了两次`commit`，但是内容并没有变化
- 比如原始状态如下图所示：
![image.png|325](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230209162539.png)
- 想要回退到`c5`状态，那么只需要`git revert ac79aa`即可
![image.png|300](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230209162654.png)
- 注意！！
- **不是将状态回退到C5状态**，而是***将C5提交引起的相关修改全部还原***，C6等等另外的提交不变。
- 因此，一旦发现出错之后，就应当立即进行`git revert`回退，否则就需要`git revert`多个`commit`
---
author: Albert
date: 2024-02-22
date created: 2023-05-09
tags:
  - Blog
  - Git
title: Git-分离HEAD
---

#Git

# Git-分离HEAD

## 1. 分离HEAD的场景之一

- 比如需要打tag
- 例如`Learn Git branching`
  ![image.png|300](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230108210925.png)
- 利用`git checkout c2`来将目前的`HEAD`指针指向`c2`，然后执行`git tag v1`

```shell
# 假定目前的head没有分离，还是指向c5(等于HEAD->main)
# checkout c2 使得 HEAD游标分离
git checkout c2

# 打上tag
git tag v1

# 合并HEAD
git chekcout main
```

- 注意：`HEAD`分离的情况下，无法使用`git reset --hard <xxxxxx>`命令
- 一个疑问: 这个场景当中，上述代码的第三步如果执行`git checkout c5`，能够使得分离的`HEAD`重新合并吗？并不可以，`branch`和`commit`是两个概念
  ![image.png|425](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230108211747.png)

## 2. 修复分离的HEAD

> cite: https://stackoverflow.com/questions/10228760/how-do-i-fix-a-git-detached-head

### 2.1 情况1： 分离的HEAD在分支的旧commit上面

- 执行`git checkout <branch>`

### 2.2 情况2：分离的HEAD在分支的新commit上面

- 也就是说，分离的`HEAD`是一个更加新的`commit`
- 比如下图，想要把`2fe389`移动到`0eb71c`后面，成为`test-revert-branch`分支的一部分
  ![image.png|950](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230209202205.png)
- 如果直接`checkout test-revert-branch`，那么`2fe`的`commit`会丢失
- 因此，需要临时起一个新的分支

```shell
# 临时起一个分支tmp
# 用来放2fe对应的commit
# 完成之后再删掉
git branch tmp
```

![image.png|850](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230209202649.png)

- 此后，执行`checkout`和`merge`操作

```shell
# 将tmp分支和2fe289对齐
# 此时HEAD脱离detach状态
git checkout tmp

# 切换到test-revert-branch分支上面，因为后者状态滞后

git checkout test-revert-branch

# 合并两个分支
# 将tmp merge到当前分支上面
git merge tmp

# 删除tmp
- git branch -d tmp
```

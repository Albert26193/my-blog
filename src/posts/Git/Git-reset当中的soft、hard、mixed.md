---
author: Albert
date: 2024-02-22
date created: 2023-05-098 14:17
date updated: 2023-02-13 13:19
description: Git使用常识
link: https://www.notion.so/Git-reset-soft-hard-mixed-243ea4b321fa42fb8fcde887becee21c
notionID: 243ea4b3-21fa-42fb-8fcd-e887becee21c
tags:
  - Blog
  - Git
title: Git-reset当中的soft和hard
---

# Git-reset当中的soft和hard

> cite: https://stackoverflow.com/questions/3528245/whats-the-difference-between-git-reset-mixed-soft-and-hard

## 1. `git`的三棵树

- `workspace/source tree`: 就是本地物理意义上的文件树
- `index/staged/staging tree`：用过`git add`添加进去的“暂存区”
- `commit tree`：持久化写入

## 2. reset回退的三种状态

1. `soft`：影响`commit tree`
2. `mixed`：影响`commit tree` + `staged tree`
3. `hard`：影响`commit tree` + `staged tree` + `workspace`

![image.png|450](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230213125910.png)

## 3. `git reset --soft`

- 只影响`commit tree`
- 比如以下场景：
  ![image.png|400](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230213130100.png)
- 想要回退红框里面的提交，但是希望添加进去的`file11.md`这个文件，依然处在`staged tree`当中，所以需要使用**不影响当前暂存区状态(staged tree)** 的命令`git reset --soft 4a4fa3a`
- 使用之后，`commit tree`如下所示：
  ![image.png|425](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230213130506.png)
- `staged tree`如下所示：**状态不变**
  ![image.png|325](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230213130541.png)
  ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230213130620.png)

## 4. `git reset --mixed`

- 这是`reset`的默认状态
- 暂存区（staged tree）会改变，但是 工作区（workspace）不变
- 示例如下所示：
  - 工作区有“未暂存的更改”：tmp-file.md
  - 完成提交 c14d7c8d，现在希望将此提交回退到 44542fb5 状态

![image.png|425](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230213131440.png)

- 回退之后，staged tree 应该是空的，因为 44542fb 状态对应的 staged tree 就是空的
- workspace 保持不受影响，那么之前添加的 tmp-file.md 依然得到了保留，并且 file12.md 会回退到workspace当中（被从staged tree 当中清理出来了）
  ![image.png|575](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230213131912.png)

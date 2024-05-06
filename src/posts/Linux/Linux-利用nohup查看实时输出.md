---
author: Albert
date: 2024-02-22
date created: 2023-05-09
description: Linux常用命令
tags:
  - Blog
  - Linux
title: Linux-利用nohup查看实时输出
---

# Linux-利用nohup查看实时输出

> [!info]
>
> - https://www.cnblogs.com/zouhong/p/12191196.html
> - https://www.cnblogs.com/yychuyu/p/13159338.html

在工作中，我们很经常跑一个很重要的程序，有时候这个程序需要跑好几个小时，甚至需要几天，这个时候如果我们退出终端，或者网络不好连接中断，那么程序就会被中止。而这个情况肯定不是我们想看到的，我们希望即使终端关闭，程序依然可以在跑。

## 1. 什么是 nohup

- `nohup` 就是 no hang up
- `nohup` 会忽略 _所有的中断信号_
- `nohup` 可以使得命令永久运行下去，并且将其输出写入（或追加）到当前目录下的 `nohup.out` 文件当中
- 比如用 `ssh` 接入一个远程服务器，希望退出 `ssh` 之后，程序依然执行，那么就可以使用 `nohup` 命令
- 起两个作用：
  - 忽视网络波动，服务器始终运行程序
  - 查看 `nohup.out`，查看日志

## 2. nohup 常常和 `&` 结合使用

- `&` 说明是放在后台运行的，但是用户退出（挂起）的时候，也会跟着退出
- 比如 `nohup sh test.sh &`，执行 `test.sh` 脚本，并且用 `nohup` 挂起，同时用 `&` 放在后台执行
- `nohup command > out.file 2>&1 &` 当中，`2> &1` 说明将标准错误（2）重定向到标准输出（1）当中，但是标准输出（1）又被重定向到 `out.file` 当中（等于全被重定向到 `out.file` 当中了）
- `nohup` 可以用 `Ctrl + C` 直接杀掉

## 3. 结合 `tail -f` 查看 `nohup.out` 的热更新

- `tail -f`：不断追加，实现实时查看的效果

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230209175735.png)

- 结合 `nohup`

```shell
# 写入out.log
# tail -f 实时查看
nohup python -u showFunc.py > out.log & tail -f out.log
```

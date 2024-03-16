---
author: Albert
category: CS-基础
date: 2024-02-24
date created: 2023-05-09
date updated: 2022-12-11 16:50
link: https://www.notion.so/Linux-Tmux-82488e3eb82f47cd990cdec78c14bac1
tags:
  - Blog
  - Linux
  - 工具
title: Linux-Tmux操作备忘录
notionID: 82488e3e-b82f-47cd-990c-dec78c14bac1
---

# Linux-Tmux操作备忘录

> [!info]
> - https://www.ruanyifeng.com/blog/2019/10/tmux.html
> - https://yangfangs.github.io/wiki/2020-4-12-tmux-shortcut-key

## 1. tmux概念

- 用户和计算机的一次在终端上面的交互被称为一次“会话”（session），终端窗口关闭，则会话结束，会话内部的进程也随之结束。
- 比如进行一次ssh，如果网络中断，那么再次连接之后，其实是找不到原来的会话的，之前执行的进程也随之中断。
- 如果使用tmux的话，可以使得“窗口”和“实际进程”分离，即便关闭窗口，其背后的进程也会一直运行。（实现解绑）
  - 单个窗口当中运行多个会话
  - 让新窗口接入旧会话
  - 允许每个会话有多个连接窗口，多人同时共享会话
  - 支持窗口的拆分和组合

---

- 一个简单的例子，如果使用`alacritty`运行一个死循环打印的`cpp`程序。终端窗口关闭，则程序终止。实例如下

![demo.gif](http://img-blog-01.oss-cn-shanghai.aliyuncs.com/img/2022-11-27-193749.gif)

> 不难看出，关闭窗口之后，进程随之中止。

- 如果上面的例子当中，使用tmux，可以实现不同的效果。通过`detach`使得终端和进程分开。

![tmux.gif](http://img-blog-01.oss-cn-shanghai.aliyuncs.com/img/2022-11-27-193750.gif)

---

## 2. tmux常见操作

> 会话：session
> 窗口：window
> 窗格：pane
> 每个session是一个独立进程

### 2.1 新建会话

```shell
$ tmux new -s <session-name>
```

### 2.2 分离会话

```shell
$ tmux detach

## <leader>d
```

### 2.3 接入会话

```shell
## 列出所有session
$ tmux ls
## or
$ tmux list-session
$tmux attach -t 0
$tmux attach -t <session-name>
```

### 2.4 切换会话

```shell

## 使用会话编号
$ tmux switch -t 0

## 使用会话名称
$ tmux switch -t <session-name>

## 快捷键
## <leader> s
```

### 2.5 杀死会话

```shell
## 使用会话编号
$ tmux kill-session -t 0

## 使用会话名称
$ tmux kill-session -t <session-name>
```

### 2.6 重命名会话

```shell
$ tmux rename-session -t 0 <new-name>

#<leader>$
```

### 2.7 会话常用快捷键

![image.png|475](http://img-blog-01.oss-cn-shanghai.aliyuncs.com/img/2022-11-27-193750.png)

```shell
#<leader>d：分离当前会话。
#<leader>s：列出所有会话。
#<leader>$：重命名当前会话。
```

![image.png](http://img-blog-01.oss-cn-shanghai.aliyuncs.com/img/2022-11-27-193752.png)

---

### 2.7 划分窗格

```shell
## 划分上下两个窗格
$ tmux split-window

## 划分左右两个窗格
$ tmux split-window -h

#<leader>"
#<leader>%
```

### 2.8 移动focus

```shell
## 光标切换到上方窗格
$ tmux select-pane -U

## 光标切换到下方窗格
$ tmux select-pane -D

## 光标切换到左边窗格
$ tmux select-pane -L

## 光标切换到右边窗格
$ tmux select-pane -R

## <leader>上/下/左/右（箭头）
```

### 2.9 交换窗格位置

```shell
## 当前窗格上移
$ tmux swap-pane -U

## 当前窗格下移
$ tmux swap-pane -D
```

### 2.10 窗格常用快捷键

- Ctrl+b %：划分左右两个窗格。
- Ctrl+b "：划分上下两个窗格。
- Ctrl+b $arrow key$$：光标切换到其他窗格。$$arrow key$$是指向要切换到的窗格的方向键，比如切换到下方窗格，就按方向键↓。

- Ctrl+b ;：光标切换到上一个窗格。
- Ctrl+b o：光标切换到下一个窗格。
- Ctrl+b {：当前窗格与上一个窗格交换位置。
- Ctrl+b }：当前窗格与下一个窗格交换位置。
- Ctrl+b Ctrl+o：所有窗格向前移动一个位置，第一个窗格变成最后一个窗格。
- Ctrl+b Alt+o：所有窗格向后移动一个位置，最后一个窗格变成第一个窗格。
- Ctrl+b x：关闭当前窗格。
- Ctrl+b !：将当前窗格拆分为一个独立窗口。
- Ctrl+b z：当前窗格全屏显示，再使用一次会变回原来大小。
- Ctrl+b Ctrl+$arrow key$：按箭头方向调整窗格大小。
- Ctrl+b q：显示窗格编号。

--

### 2.11 新建窗口

```shell
$ tmux new-window

## 新建一个指定名称的窗口
$ tmux new-window -n <window-name>

## <leader>c
```

### 2.12 切换窗口

```shell
## 切换到指定编号的窗口
$ tmux select-window -t <window-number>

## 切换到指定名称的窗口
$ tmux select-window -t <window-name>

#<leader>w 显示窗口
#<leader>{num} 切换
```

### 2.13 重命名窗口

```shell
$ tmux rename-window <new-name>
## <leader>,
```

### 2.14 窗口常用快捷键

```shell
## ctrl+b 就是<leader>键
Ctrl+b c：创建一个新窗口，状态栏会显示多个窗口的信息。
Ctrl+b p：切换到上一个窗口（按照状态栏上的顺序）。
Ctrl+b n：切换到下一个窗口。
Ctrl+b <number>：切换到指定编号的窗口，其中的<number>是状态栏上的窗口编号。
Ctrl+b w：从列表中选择窗口。
Ctrl+b ,：窗口重命名。
```

## 3. tmux自定义快捷键

- 不建议自定义快捷键
- 最多改一个leader键，我自己用的是`<ctrl + a>`, 取代`<ctrl + b>`

## 4. tmux 交环窗格

- 将 1 号 `window` 当中的 `2` 号窗格，交换到 `3` 号窗口当中，应该如何实现？

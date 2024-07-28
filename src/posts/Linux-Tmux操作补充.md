---
author: Albert
date: 2024-05-20
date created: 2023-05-09
tags:
  - 工具
  - Linux
  - Blog
title: Linux-Tmux操作补充
---

# Linux-Tmux操作补充

> [!note]
>  [session - How to join two tmux windows into one, as panes? - Stack Overflow](https://stackoverflow.com/questions/9592969/how-to-join-two-tmux-windows-into-one-as-panes)

## 1. `Tmux` 操作说明

- 本文章主要用来记录 `Tmux` 的一些进阶性质的操作，对于基本的概念和入门级别的操作不再冗述。

## 2. 窗格的移动

### 2.1 将目标 `pane` 加入当前 `window`

```bash
# 将 当前会话的 `3` 号 window 当中的活跃 pane 加入到当前 window 当中

tmux join-pane -s :3

# # 将 当前会话的 `3` 号 window 当中的活跃 pane 加入到当前 window 的 pane 1 当中

tmux join-pane -s :3.1
```

- `join-pane -s` 当中的 `s` 是 `source` 的意思，指将 `source pane` 加入到当前 `window` 当中。
- `:3.1` 如何理解？ `a:b` 当中，`a` 指具体的 `session`，如果省略 `a`，表示当前的 `session`。`:3.1` 当中的 `1` 指 `pane` 号。

### 2.2 将当前 `pane` 移动到目标 `window`

```bash
# 将当前会话的 当前 window 当前 pane，加入到 当前会话的 4 号 window 当中

tmux join-pane -t :4
```

- `join-pane -t` 当中的 `t` 是 `target` 的意思，指将当前 `pane` 放到 `target` 指定的 `window` 当中去。

### 2.3 将当前 `pane` 和同一 `window` 中的 `pane 2` 交换

```bash
# 将当前会话的 当前 window 当前 pane， 和同一 window 当中的 pane2 交换

tmux swap-pane -t 2
```

### 2.4 将当前 `pane` 移动到一个新窗口当中

```bash
tmux break-pane -t :
```

- `:` 省略参数表示默认开一个新窗口
- 也可以指定具体的窗口号，比如 `:8`，就是将当前 `pane` 移动到全新 `window 8` 当中去

## 3. 窗格操作总结

### 3.1 动词

- `join-pane`：以 `pane` 为单位进行 `join`
- `swap-window`：以 `window` 为单位进行 `swap`
- `swap-pane`：以 `window` 为单位进行 `swap`
- `break-pane`：以 `pane` 为单位进行 `break`，`break` 到一个新 `window` 当中。

### 3.2 介词

- `-t`：`target` 指定目标单位
- `-s`：`source` 指定源单位

### 3.3 宾语

- `X:Y.Z`: `X` 指 `seesion` 号， `Y` 指 `window` 号。`Z` 指 `Pane` 号。

## 4. 封装到 `zshrc` 当中

```bash
# ~.zshrc
alias "jp"="tmux join-pane -t"
alias "sp"="tmux swap-pane -t"
alias "sw"="tmux swap-window -t"

```

- 这里只做最简单的3个命令映射，更加复杂的映射可以再修改。

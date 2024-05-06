---
author: Albert
date: 2024-01-19
tags:
  - Blog
  - Go
  - Interview
title: Go-byte和rune区别
---

# Go-byte和rune区别

一个字符串是由若干个字符组合而成的，比如 hello，就由 5 个字符组成。

在 Go 中字符类型有两种，分别是：

`byte` 类型：字节，是 `uint8` 的别名类型
`rune` 类型：字符，是 `int32` 的别名类型

`byte` 和 `rune` ，虽然都能表示一个字符，但 `byte` 只能表示 `ASCII` 码表中的一个字符（`ASCII` 码表总共有 `256` 个字符），数量远远不如 `rune` 多。

`rune` 表示的是 `Unicode` 字符中的任一字符，而我们都知道，`Unicode` 是一个可以表示世界范围内的绝大部分字符的编码，这张表里几乎包含了全世界的所有的字符，当然中文也不在话下。

能表示的字符更多，意味着它占用的空间，也要更大，所占空间是 4个 `byte` 的大小。

下面以一段代码来验证一下他们的占用空间的差异

```go
var a byte = 'A'
var b rune = 'B'
fmt.Printf("a 占用 %d 个字节数\n", unsafe.Sizeof(a))
fmt.Printf("b 占用 %d 个字节数\n",unsafe.Sizeof(b))

// output
// a 占用 1 个字节数
// b 占用 4 个字节数
```

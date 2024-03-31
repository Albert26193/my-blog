---
author: Albert
date: 2024-02-22
date created: 2023-10-20
date updated: 2023-10-20 13:10
description: info
tags:
  - Blog
  - interview
  - back-end
  - Go
title: Go-Defer是什么
---

# Go-Defer是什么

> [!citaion] > `defer` 关键字的调用时机以及多次调用 `defer` 时执行顺序是如何确定的

## 1. 什么是 `defer`

- 会在当前函数返回前执行传入的参数，**无论是否成功，`defer`都会确保代码在函数结束前执行**。
- 换言之，无论是否有异常退出，`defer` 当中的代码一定会执行，这为确保资源释放/日志记录和其他任务提供了保障。
- 比如需要关闭文件或者数据库，常常需要用到 `defer`
- 比如下面的代码

```go
	file, err := os.Open("./testcases.txt")
	if err != nil {
		fmt.Println("Error", err)
		return
	}
	defer file.Close()
```

- 无论 `file` 的打开是否正常，都会关闭文件。

---

- 归根结底就是一句话：**_`defer` 本质上就是一道保险，确保资源在异常状态下不至于泄漏。_**

## 2. `defer` 执行顺序

- `defer` 的调用顺序，类似于堆栈结构，遵循先进后出 `First In Last Out` 的顺序。
- `defer` 只有在函数即将退出之前才会被压入堆栈，然后执行。
- `defer` **在 `return` 语句执行之后才会执行。**

---

- 比如下面的代码

```go
package main

import "fmt"

// defer 关键字的调用时机以及多次调用 defer 时执行顺序是如何确定的；

// like Stack: First In Last Out(FILO)
func WhenToCallGo() {
	for i := 0; i < 5; i++ {
		defer fmt.Println(i)
	}
}
```

- 执行结果如下所示：

![image.png|248](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20231020125052.png)

---

- 再比如下面的代码，其输出结果佐证了“函数在即将退出前才会将 `defer` 压入堆栈”

```go
func CallBlock() {
	{
		defer fmt.Println("defer runs")
		fmt.Println("block ends")
	}

	fmt.Println("main ends")
}
```

- 输出如下：

![|155](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20231020125318.png)

## 3. `defer` 预计算

- `go` 语言当中所有的传参，都是值传递，`defer`也不例外。
- `defer` 对于语句当中的参数，在执行到对应 `defer` 语句的时候，**就会立即进行计算**，而不是在函数退出之前才计算。
- 比如下面的代码

```go
func PreCalCulate() {
	startedAt := time.Now()
	defer fmt.Println(time.Since(startedAt))

	time.Sleep(2 * time.Second)
}
```

- 其输出结果非常小，为 `0` 或者 `xxx ns`，可以认为是瞬间执行的。
- 因为执行到 `defer` 所在语句的时候，传入了 `time.Since(startedAt)` 的“值”，也就是当场会进行计算。

---

- 如何解决这个问题？
- 向 `defer` 关键字传入**匿名函数**，比如
- 其作用原理类似于回调，函数体会被当场传入，但是在最终退出 `main` 函数的时候，才会被调用。

```go
func main() {
	startedAt := time.Now()
	defer func() { fmt.Println(time.Since(startedAt)) }()

	time.Sleep(time.Second)
}
```

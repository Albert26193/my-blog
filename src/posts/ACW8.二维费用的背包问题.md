---
author: Albert
date: 2024-04-02
date created: 2023-12-28
tags:
  - Blog
  - Algorithm
  - 背包问题
  - ACW
title: ACW8.二维费用的背包问题
---

# ACW8.二维费用的背包问题

## 1. 题目

[8. 二维费用的背包问题 - AcWing题库](https://www.acwing.com/problem/content/8/)

- 有 $N$ 件物品和一个容量是 $V$ 的背包，背包能承受的最大重量是 $M$。
- 每件物品只能用一次。体积是 $v_i$，重量是 $m_i$，价值是 $w_i$。
- 求解将哪些物品装入背包，可使物品总体积不超过背包容量，总重量不超过背包可承受的最大重量，且价值总和最大。
- 输出最大价值。

#### 输入格式

- 第一行三个整数，$N,V, M$，用空格隔开，分别表示物品件数、背包容积和背包可承受的最大重量。
- 接下来有 $N$ 行，每行三个整数 $v_i, m_i, w_i$，用空格隔开，分别表示第 $i$ 件物品的体积、重量和价值。

#### 输出格式

输出一个整数，表示最大价值。

#### 数据范围

$0 \lt N \le 1000$  
$0 \lt V, M \le 100$  
$0 \lt v_i, m_i \le 100$  
$0 \lt w_i \le 1000$

#### 输入样例

```
4 5 6
1 2 3
2 4 4
3 4 5
4 5 6
```

#### 输出样例

```
8
```

## 2. 思路

- 二维的 `01` 背包问题，还是可以当成一维的去处理
- 核心代码如下

```go
for k := 0; k < N; k++ {
		currentVolume := v[k]
		currentWeight := m[k]
		for i := V; i >= currentVolume; i-- {
			for j := M; j >= currentWeight; j-- {
				f[i][j] = maxx(f[i][j], f[i-currentVolume][j-currentWeight]+w[k])
			}
		}
	}

	fmt.Println(f[V][M])
```

## 3. 代码

```go
package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {

	in := bufio.NewReader(os.Stdin)

	var N, V, M int
	fmt.Fscan(in, &N, &V, &M)

	var v, m, w = make([]int, N), make([]int, N), make([]int, N)
	for i := 0; i < N; i++ {
		fmt.Fscan(in, &v[i], &m[i], &w[i])
	}

	// f[i][j] = x
	// max Volume is i; max Weight is j, max Profit is x
	f := make([][]int, V+1)
	for i := 0; i <= V; i++ {
		f[i] = make([]int, M+1)
	}

	for k := 0; k < N; k++ {
		currentVolume := v[k]
		currentWeight := m[k]
		for i := V; i >= currentVolume; i-- {
			for j := M; j >= currentWeight; j-- {
				f[i][j] = maxx(f[i][j], f[i-currentVolume][j-currentWeight]+w[k])
			}
		}
	}

	fmt.Println(f[V][M])
}

func maxx(nums ...int) int {
	res := nums[0]
	for _, v := range nums {
		if v > res {
			res = v
		}
	}

	return res
}


```

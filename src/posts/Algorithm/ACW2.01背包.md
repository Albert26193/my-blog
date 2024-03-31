---
author: Albert
date: 2024-03-31
date created: 2023-11-28
date updated: 2023-11-28 21:08
description: info
tags:
  - Blog
  - acw
  - algorithm
  - 背包问题
  - 01背包
title: ACW2.01背包
---

# ACW2.01背包

## 1. 题目

> url: https://www.acwing.com/problem/content/2/

有 $N$ 件物品和一个容量是 $V$ 的背包。每件物品只能使用一次。

第 $i$ 件物品的体积是 $v_i$，价值是 $w_i$。

求解将哪些物品装入背包，可使这些物品的总体积不超过背包容量，且总价值最大。  
输出最大价值。

#### 输入格式

第一行两个整数，$N，V$，用空格隔开，分别表示物品数量和背包容积。

接下来有 $N$ 行，每行两个整数 $v_i, w_i$，用空格隔开，分别表示第 $i$ 件物品的体积和价值。

#### 输出格式

输出一个整数，表示最大价值。

#### 数据范围

$0 \lt N, V \le 1000$  
$0 \lt v_i, w_i \le 1000$

#### 输入样例

> 4 5
> 1 2
> 2 4
> 3 4
> 4 5

#### 输出样例

> 8

## 2. 思路

- 此题如果按照常规的状态机转移的思路去完成，并没有很大的难度，属于模板题。
- 难点在于如何进行*一维空间复杂度*的优化。
- `f[j]` 代表容积为 `j` 时刻，对物品进行选择，所能够选择出来的*最大价值*。那么，容易发现，`f[j]` 必然从 `f[j - v[0]]  or f[j - v[1]] ... or f[j - v[i]]` 等多个状态转移过来。
- 此题优化的本质在于**无后效性**，也就是说，`f[j]` **只依赖于之前的状态，不依赖于之后的状态**。因此，需要逆序遍历。
- 为什么需要**逆序**？比如当前物品体积为 `3`，那么， `f[7] = max(f[4] + worth, f[7])`，如果是顺序遍历的话，`f[4]` 可能来自于 `f[4] = f[4 - 3] + worth`（`worth` 为当前物品价格）。那么，_当前物品就被选中了两次。_
- **逆序** 可以保证当前物品只被选中一次，对于同样的 `f[7] = max(f[4] + worth, f[7])` 转移方式，如果是逆序遍历，那么 _`f[7]` 一定早于 `f[4]` 遍历_，**此时的 `f[4]` 可以确保一定没有选中当前物品，规避了重复选择的问题。**
- **除了逆序以外，其他的代码和*多重背包问题*的代码完全一样。**
- 核心代码如下

```go
f := make([]int, V+1)
	for i := 0; i < N; i++ {
		currentVolume := v[i]
		for j := V; j >= currentVolume; j-- {
			f[j] = maxx(f[j-currentVolume]+w[i], f[j])
		}
	}
```

## 3. 代码

```go
package main

import (
	"bufio"
	"fmt"
	"os"
)

// TAGS: dp

// 01 package
// f[i][j] ==> from [0, ... i-1] choose items, volume is j, max worth is f[i][j]

// choose or not choose
// f[i][j] = f[i-1][j]
// f[i][j] = f[i-1][j - v[i-1]] + w[i-1]

func main() {
	// input
	file, err := os.Open("./testcases.txt")
	if err != nil {
		fmt.Println("Error", err)
		return
	}

	in := bufio.NewReader(file)
	defer file.Close()

	// in := bufio.NewReader(os.Stdin)
	var N, V int
	fmt.Fscan(in, &N)
	fmt.Fscan(in, &V)

	var v = make([]int, N)
	var w = make([]int, N)
	for i := 0; i < N; i++ {
		fmt.Fscan(in, &v[i])
		fmt.Fscan(in, &w[i])
	}

	// fmt.Println(N, V, v, w)

	// no optimization
	/*
		f := make([][]int, N+1)
		for i := 0; i <= N; i++ {
			f[i] = make([]int, V+1)
		}

		f[0][0] = 0
		for i := 1; i <= N; i++ {
			for j := 1; j <= V; j++ {
				f[i][j] = f[i-1][j]
				currentVolume := v[i-1]
				if j >= currentVolume {
					f[i][j] = maxx(f[i][j], f[i-1][j-currentVolume]+w[i-1])
				}
			}
		}*/

	// reverse iterator
	f := make([]int, V+1)
	for i := 0; i < N; i++ {
		currentVolume := v[i]
		for j := V; j >= currentVolume; j-- {
			f[j] = maxx(f[j-currentVolume]+w[i], f[j])
		}
	}

	fmt.Println(f[V])
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

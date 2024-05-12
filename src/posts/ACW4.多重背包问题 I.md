---
author: Albert
date: 2024-04-02
date created: 2023-12-28
date: 2023-12-28 13:27
tags:
  - ACW
  - Leetcode
  - 背包问题
  - 模板题
  - Blog
title: ACW4.多重背包问题 I
---

# ACW4.多重背包问题 I

## 1. 题目

- 有 $N$ 种物品和一个容量是 $V$ 的背包。
- 第 $i$ 种物品最多有 $s_i$ 件，每件体积是 $v_i$，价值是 $w_i$。
- 求解将哪些物品装入背包，可使物品体积总和不超过背包容量，且价值总和最大。
- 输出最大价值。

#### 输入格式

- 第一行两个整数，$N，V$，用空格隔开，分别表示物品种数和背包容积。
- 接下来有 $N$ 行，每行三个整数 $v_i, w_i, s_i$，用空格隔开，分别表示第 $i$ 种物品的体积、价值和数量。

#### 输出格式

输出一个整数，表示最大价值。

#### 数据范围

$0 \lt N, V \le 100$  
$0 \lt v_i, w_i, s_i \le 100$

#### 输入样例

```
4 5
1 2 3
2 4 1
3 4 3
4 5 2
```

#### 输出样例

```
10
```

## 2. 思路

- 此题为多重背包模板题
- _多重背包_ 可以简单退化成 _普通的 `01`背包问题_
- 比如有 `m` 件相同物品 `x`，那么可以逐个去枚举 `x`，将其当成 `m` 个不同的物品，进行 `01` 背包的处理即可。

## 3. 代码

```go
package main

import (
	"bufio"
	"fmt"
	"os"
)

// TAGS: dp
// f[i][j] ==> from [0, ... , i-1], volume is j, max value is f[i][j]
func main() {
	in := bufio.NewReader(os.Stdin)

	var N, V int
	fmt.Fscan(in, &N, &V)

	var v = make([]int, N)
	var w = make([]int, N)
	var s = make([]int, N)

	allCount := 0
	for i := 0; i < N; i++ {
		fmt.Fscan(in, &v[i], &w[i], &s[i])
		allCount += s[i]
	}

	f := make([]int, V+1)

    for i := 0; i < N; i++ {
		for j := 0; j < s[i]; j++ {
			currentVolume := v[i]
			for k := V; k >= currentVolume; k-- {
				f[k] = maxx(f[k], f[k-currentVolume]+w[i])
			}
		}
	}


	// fmt.Println(v, w, s)
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

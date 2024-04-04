---
author: Albert
date: 2024-04-05
date created: 2024-04-04
tags:
  - Blog
  - acw
  - 背包问题
  - 动态规划
  - algorithm
  - 混合背包
  - 模板题
title: ACW7.混合背包问题
---

# ACW7.混合背包问题

## 1. 题目

- [7. 混合背包问题 - AcWing题库](https://www.acwing.com/problem/content/7/)

 有 $N$ 种物品和一个容量是 $V$ 的背包。
物品一共有三类：

-   第一类物品只能用1次（01背包）；
-   第二类物品可以用无限次（完全背包）；
-   第三类物品最多只能用 $s_i$ 次（多重背包）；

每种体积是 $v_i$，价值是 $w_i$。
求解将哪些物品装入背包，可使物品体积总和不超过背包容量，且价值总和最大。  
输出最大价值。

#### 输入格式

- 第一行两个整数，$N，V$，用空格隔开，分别表示物品种数和背包容积。
- 接下来有 $N$ 行，每行三个整数 $v_i, w_i, s_i$，用空格隔开，分别表示第 $i$ 种物品的体积、价值和数量。
  -   $s_i = -1$ 表示第 $i$ 种物品只能用1次；
  -   $s_i = 0$ 表示第 $i$ 种物品可以用无限次；
  -   $s_i >0$ 表示第 $i$ 种物品可以使用 $s_i$ 次；

#### 输出格式

输出一个整数，表示最大价值。

#### 数据范围

$0 \lt N, V \le 1000$  
$0 \lt v_i, w_i \le 1000$  
$-1 \le s_i \le 1000$

#### 输入样例

```
4 5
1 2 -1
2 4 1
3 4 0
4 5 2
```

#### 输出样例

```
8
```

## 2. 思路

- *多重背包*：某个物品最多可以取 `x` 次
- *`01` 背包*：一个物品最多取一次
- *完全背包*：一个物品可以取无限次
- *分组背包*：一个物品组里面可以取一个物品
- **混合背包**：**多重背包** + **`01`背包** + **完全背包** 
- 在此题当中，对于每个物品，判定具体的背包类型，然后进行计算即可。

## 3. 代码

```go
package main

import (
    "fmt"
    "bufio"
    "os"
)

func main() {
    var N, V int
    in := bufio.NewReader(os.Stdin)
    fmt.Fscan(in, &N, &V)
    
    // f[k] --> 体积为 k 的情况下，最大收益是 f[k]
    f := make([]int, V + 1)
    for i := 0; i < N; i++ {
        var v, w, s int
        
        fmt.Fscan(in, &v, &w, &s)
        switch {
        // 01 背包
        case s == -1:
            for j := V; j >= v; j-- {
                f[j] = maxx(f[j], f[j - v] + w)
            }
        // 完全背包
        case s == 0:
            for j := v; j <= V; j++ {
                f[j] = maxx(f[j], f[j - v] + w)
            }
        // 多重背包
        case s > 0:
            // 拆成 1 2 4 8 这样的堆
            for k := 1;  k <= s; k *= 2 {
                curVolume, curWorth := k * v, k * w
                for j := V; j >= curVolume; j-- {
                    f[j] = maxx(f[j], f[j - curVolume] + curWorth)
                }
                s -= k
            }
            // 处理余下的部分
            if s > 0 {
                curVolume, curWorth := s * v, s * w
                for j := V; j >= curVolume; j-- {
                    f[j] = maxx(f[j], f[j - curVolume] + curWorth)
                }
            }
        }
    }
    
    fmt.Println(f[V])
}

func maxx(nums ...int) int {
    res := nums[0]
    for _, num := range nums {
        if num > res {
            res = num 
        }
    }
    
    return res
}
```

---

- 此外，多重背包的部分，用一个另外的数组去整理物品状态，或许是更加好的做法

```go
// 多重背包
case s > 0:
    items := make([][]int, 0)
    // 拆成 1 2 4 8 这样的堆
    for k := 1;  k <= s; k *= 2 {
        items = append(items, []int{k * v, k * w})
        s -=k 
    }
    // 处理余下的部分
    if s > 0 {
        items = append(items, []int{s * v, s * w})
    }
    // 01 背包
    for _, item := range items {
        curVolume, curWorth := item[0], item[1]
        for j := V; j >= curVolume; j-- {
            f[j] = maxx(f[j], f[j - curVolume] + curWorth)
        }
    }
```
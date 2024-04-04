---
author: Albert
date: 2024-04-05
date created: 2024-04-02
tags:
  - Blog
  - 01背包
  - 背包问题
  - acw
  - 模板题
  - algorithm
  - 分组背包
title: ACW9.分组背包问题
---

# ACW9.分组背包问题

## 1. 题目

- 有 $N$ 组物品和一个容量是 $V$ 的背包。
- 每组物品有若干个，同一组内的物品最多只能选一个。  
- 每件物品的体积是 $v_{ij}$，价值是 $w_{ij}$，其中 $i$ 是组号，$j$ 是组内编号。
- 求解将哪些物品装入背包，可使物品总体积不超过背包容量，且总价值最大。
- 输出最大价值。

#### 输入格式

- 第一行有两个整数 $N，V$，用空格隔开，分别表示物品组数和背包容量。
- 接下来有 $N$ 组数据：
  -   每组数据第一行有一个整数 $S_i$，表示第 $i$ 个物品组的物品数量；
  -   每组数据接下来有 $S_i$ 行，每行有两个整数 $v_{ij}, w_{ij}$，用空格隔开，分别表示第 $i$ 个物品组的第 $j$ 个物品的体积和价值；

#### 输出格式

输出一个整数，表示最大价值。

#### 数据范围

$0 \lt N, V \le 100$  
$0 \lt S_i \le 100$  
$0 \lt v_{ij}, w_{ij} \le 100$

#### 输入样例

```
3 5
2
1 2
2 4
1
3 4
1
4 5
```

#### 输出样例

```
8
```

## 2. 思路

- 依然是  `01` 背包问题的一种变体，但是也有一些区别。
- 首先，考虑枚举物品的组，假定当前组是第 `i` 组。
- 其次，是先枚举物品还是先枚举体积呢？**应该是先枚举体积，*因为一组当中只能选一个物品，所以物品应该放到最后去枚举***。
- 换一句话说，当前的体积 `f[k]` 是通过*当前组当中的某一个物品*转移而来的，所以物品要放到最后枚举。

## 3. 代码

```go
package main

import (
    "fmt"
    "os"
    "bufio"
)

func main() {
    in := bufio.NewReader(os.Stdin)
    
    var n, v int
    fmt.Fscan(in, &n, &v)
    
    volumes := make([][]int, n)
    worth := make([][]int, n)
    for i := 0; i < n; i++ {
        var groupSize int
        fmt.Fscan(in, &groupSize)
        
        volumes[i] = make([]int, groupSize)
        worth[i] = make([]int, groupSize)
        for j := 0; j < groupSize; j++ {
            var v, w int
            fmt.Fscan(in, &v, &w)
            volumes[i][j], worth[i][j] = v, w 
        }
    }
    
    // package
    // f[v] --> max worth
    f := make([]int, v + 1)
    
    // i: group 
    for i := 0; i < n; i++ {
        curSize := len(volumes[i])
        // j: volumes
        // 为什么先枚举体积？因为一组只能选一个
        // 最后才能进行组内的选择
        for j := v; j >= 1; j-- {
            for k := 0; k < curSize; k++ {
                if j < volumes[i][k] {
                    continue
                }
                f[j] = maxx(f[j], f[j - volumes[i][k]] + worth[i][k])
            } 
        }
    }
    
    fmt.Printf("%d", f[v])
    // fmt.Println(volumes, worth)
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
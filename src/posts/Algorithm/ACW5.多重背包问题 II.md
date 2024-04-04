---
author: Albert
date: 2024-04-05
date created: 2024-04-02
tags:
  - 背包问题
  - acw
  - Blog
  - 动态规划
  - 完全背包
  - algorithm
title: ACW5.多重背包问题 II
---

# ACW5.多重背包问题 II

## 1. 题目

- [5. 多重背包问题 II - AcWing题库](https://www.acwing.com/problem/content/5/)

有 $N$ 种物品和一个容量是 $V$ 的背包。

第 $i$ 种物品最多有 $s_i$ 件，每件体积是 $v_i$，价值是 $w_i$。

求解将哪些物品装入背包，可使物品体积总和不超过背包容量，且价值总和最大。  
输出最大价值。

#### 输入格式

第一行两个整数，$N，V$，用空格隔开，分别表示物品种数和背包容积。

接下来有 $N$ 行，每行三个整数 $v_i, w_i, s_i$，用空格隔开，分别表示第 $i$ 种物品的体积、价值和数量。

#### 输出格式

输出一个整数，表示最大价值。

#### 数据范围

$0 \lt N \le 1000$  
$0 \lt V \le 2000$  
$0 \lt v_i, w_i, s_i \le 2000$

##### 提示

本题考查多重背包的二进制优化方法。

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

- **此题考察多重背包的二进制优化**
- 所谓多重背包，就是一个同类型的物品一个有 `s` 个，可以从这 `s` 个当中随便取，只要取出来体积不超标，利益尽量大即可。
- 比如朴素的做法就是退化成 `01` 背包，做 `O(n^2)` 时间复杂度的计算，逐个看每个物品是否可以加到背包当中。
- _此题的关键在于如何进行时间效率的优化_：比如现有 `17` 个同类型物品，如果逐个枚举，需要 `17` 次，但是，也可以将其分成小堆，每个小堆分别是 `1/2/4/8` 个，那么，`17 = 1 + 2 + 4 + 8 + (2)` 个，**将每个小堆视为一个物品，对其进行 `01`背包**，那么，规模就从 `17` 减少到了 `5`。
- 如果规模更大，效率的提升会更加明显。

## 3. 代码

```go
package main

import (
    "fmt"
    "bufio"
    "os"
)

func main() {
    in := bufio.NewReader(os.Stdin)

    var N, V int
    fmt.Fscan(in, &N, &V)

    f := make([]int, V + 1)

    // items 放的都是二进制的
    // 分别取 1 2 4 8 ... 然后通过这个数字组合起来
    // 转换成取 *1 *2 *4 *8 的 01 背包问题
    items := make([][]int, 0)

    for i := 0; i < N; i++ {
        var v, w ,s int
        fmt.Fscan(in, &v, &w, &s)

        for k := 1; k <= s; k *= 2 {
            s -= k
            items = append(items, []int{v * k , w * k})
        }
        if s > 0 {
            items = append(items, []int{v * s, w * s})
        }
    }

    // 01 背包，只不过枚举的范围是 1 2 4 8 ...
    for _, item := range items {
        v, w := item[0], item[1]
        for j := V; j >= v; j-- {
            f[j] = maxx(f[j], f[j - v] + w)
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

- 如果直接进行选取，不放入 `items` 数组，也是可以的

```go
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
```
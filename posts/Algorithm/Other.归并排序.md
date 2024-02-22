---
author: Albert
category: CS-算法
date: 2024-02-22
date created: 2023-05-09
date updated: 2023-01-07 15:04
description: 经典排序问题
tags:
  - 排序
  - algorithm
  - 模板题
title: Other.归并排序
url: https://www.yuque.com/albert-tdjyy/glgpzz/oe00t4
---

# Other.归并排序

## 思路

- 以数组中的中间位置为分界点（不用于快速排序将数值作为基准）
- 递归得到左边排好序的序列 + 右边排好序的序列
- 双指针法将左右两个序列合并成一个完整的有序序列（这一步是难点，也是重点）
  - 需要辅助数组`temp`，2个指针`p1`和`p2`，分别从左边序列`a[left, mid]`的起始位置和右边序列`a[mid + 1, right]`的起始位置出发，也就是从`left`和`mid + 1`出发
  - 将较小的数值顺序放入`temp`当中，如果`a[p1] <= a[p2]`，那么放入`a[p1]`，同时`p1++`。`p2`操作同理。
  - 将剩下的全部放入`temp`当中，如果`p1`序列有剩下的，那么，`temp[k++] = a[p1++]`。`p2`序列同理。此时的`temp`序列，已经是完整的有序序列了。
  - 将`temp`序列覆盖掉`a[left, right]`，完成归并。 

## 图示

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230107150423.png)

![](http://img-blog-01.oss-cn-shanghai.aliyuncs.com/img/2022-11-27-192951.gif)
![image.png](http://img-blog-01.oss-cn-shanghai.aliyuncs.com/img/2022-11-27-192951.png) 

## 代码

```cpp
#include <iostream>
#include <vector>
using namespace std;

const int N = 1e5 + 10;

void merge_sort(int* nums, int left, int right) {
    if (left >= right) {
        return;
    }
    
    int mid = (left + right) / 2;
    merge_sort(nums, left, mid);
    merge_sort(nums, mid + 1, right);
    
    vector<int> temp(right - left + 2, 0);
    int p1 = left, p2 = mid + 1, k = 0;
    while (p1 <= mid && p2 <= right) {
        if (nums[p1] <= nums[p2]) {
            temp[k++] = nums[p1++];
        } else {
            temp[k++] = nums[p2++];
        }
    }
    
    while (p1 <= mid) temp[k++] = nums[p1++];
    while (p2 <= right) temp[k++] = nums[p2++];
    
    for (int i = 0, j = left; j <= right; i++, j++) {
        nums[j] = temp[i];
    }
}

int main() {
    int n = 0;
    cin >> n;
    int nums[N];
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);        
    }
    merge_sort(nums, 0, n - 1);
    for (int i = 0; i < n; ++i) {
        printf("%d ", nums[i]);
    }
    
    return 0;
}
```

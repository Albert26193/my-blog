---
author: Albert
category: CS-算法
date: 2024-02-22
date created: 2023-12-25
tags:
  - Blog
  - Algorithm
  - 排序
  - 模板题
title: Other.快速排序
url: https://www.yuque.com/albert-tdjyy/glgpzz/hsab5n
---

# Other.快速排序

## 图示1

![image.png](http://img-blog-01.oss-cn-shanghai.aliyuncs.com/img/2022-11-27-192952.png)

## 思路1

1. 以`pivotIndex`为界，将数组分成左右两个部分，左边的全部小于`pivotIndex`，右边的全部大于等于`pivotindex`。
2. 具体做法如下，把`pivotIndex`和`right`位置的数值交换，确保`pivotIndex`在数组在最右边。
3. 利用`storeIndex`进行交换，确保小于`pivotValue`的数值统统被放在了左边。
4. 交换`storeIndex`位置和`right`位置，把`pivotIndex`放回去。

---

- 将其放到最右边的目的，是为了防止交换过程当中，`pivotIndex` 容易丢失，它自身参与交换的话，很容易换得不知道到哪里去了。放在最右边，本质上是找个明显的位置放着，为了最后能够换回来。

## 代码1

```c
#include <iostream>

const int N = 1e5 + 5;

void mySwap(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

int partition(int* a, int left, int right, int pivot_index) {
    int pivot_value = a[pivot_index];
    mySwap(a[right], a[pivot_index]);
    int store_index = left;
    for (int i = left; i < right; ++i) {
        if (a[i] < pivot_value) {
            mySwap(a[store_index], a[i]);
            store_index++;
        }
    }

    mySwap(a[right], a[store_index]);
    return store_index;
}

void quickSort(int* a, int left, int right) {
    if (left >= right) {
        return;
    }

    int pivot_index = (left + right) / 2;
    int new_pivot_index = partition(a, left, right, pivot_index);
    quickSort(a, left, new_pivot_index - 1);
    quickSort(a, new_pivot_index + 1, right);
}

int main() {
    int n = 0;
    scanf("%d", &n);
    int a[N];
    for (int i = 0; i < n; ++i) {
        scanf("%d", a + i);
    }
    quickSort(a, 0, n - 1);
    for (int i = 0; i < n; ++i) {
        printf("%d ", *(a + i));
    }

    return 0;
}
```

## 图示2

![image.png](http://img-blog-01.oss-cn-shanghai.aliyuncs.com/img/2022-11-27-192953.png)

## 思路2

- 整体思想不变，选择一个基准值，确保小于等于基准值的被放在左边，大于等于基准值的被放到右边。
- 做法上把基准值取在中间，然后从两边向中间进行交换，双指针的做法。
- 做法参考了ACwing闫学灿大佬的做法，注意边界问题的处理。
- 利用`do-while`结构去避免重复操作的问题。
- `rp`（也就是右指针）右侧的所有数据大于等于`pivotVal`，`lp`（也就是左指针）左侧所有数据小于等于`pivotVal`，因此，在划分边界的时候，要么是`rp 和 rp + 1`，要么是`lp - 1 和 lp`
- 如果边界选择`rp 和 rp + 1`，那么就要向下取整，`pivotVal = a[(left + right) / 2]`，如果边界选择`lp - 1`和`lp`，那么需要向上取整，`pivotVal = a[(left + right + 1) / 2]`。
- 联想到二分查找里面的做法，一般内部取到`xxx - 1`，那么就说明需要往上取整。如果内部取到`xxx + 1`，那么说明应该往下取整。

## 代码2

```c
#include <iostream>
#include <algorithm>

const int N = 1e5 + 5;

using namespace std;

void quickSort(int* a, int left, int right) {
    if (left >= right) {
        return;
    }

    // 遇到 xxx - 1，需要往上取整
    // 遇到 xxx + 1，需要往下取整
    int pivot = a[(left + right + 1) / 2];
    int lp = left - 1;
    int rp = right + 1;

    while (lp < rp) {
        do {
            lp++;
        } while (a[lp] < pivot);

        do {
            rp--;
        } while (a[rp] > pivot);

        if (lp < rp) {
            swap(a[lp], a[rp]);
        }
    }
    quickSort(a, left, lp - 1);
    quickSort(a, lp, right);
}

int main() {
    int n = 0;
    scanf("%d", &n);
    int a[N];
    for (int i = 0; i < n; ++i) {
        scanf("%d", a + i);
    }
    quickSort(a, 0, n - 1);
    for (int i = 0; i < n; ++i) {
        printf("%d ", *(a + i));
    }

    return 0;
}
```

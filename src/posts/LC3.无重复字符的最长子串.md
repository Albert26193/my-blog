---
author: Albert
category: CS-算法
date: 2024-02-22
date created: 2023-05-09
date: 2022-12-07 23:10
tags:
  - Blog
  - 模板题
  - Leetcode
  - Algorithm
  - 滑动窗口
title: LC3.无重复字符的最长子串
---

# LC3.无重复字符的最长子串

![image.png](http://img-blog-01.oss-cn-shanghai.aliyuncs.com/img/2022-11-27-192755.png)

## 思路：滑动窗口 + 哈希表

设置两个指针，两个指针都指向开头的位置。左指针不变，右指针不断向右移动。
如果：

1. 发现右指针所指向的位置没有出现过，那么将右指针指向的位置放入哈希表中。继续右移，直到到达终点。
2. 如果右指针指向的位置出现过，那么将左指针指向的位置擦除。不断重复，直到右指针指向的元素在哈希表中不存在。

## 代码

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        int len_s = s.size();
        int max_len = 0;
        unordered_set<char> mp;
        for (int left = 0, right = 0; right < len_s; ) {
            while (mp.count(s[right])) {
                mp.erase(s[left++]);
            }
            mp.insert(s[right]);
            max_len = max(max_len, right - left + 1);
            ++right;
        }

        return max_len;
    }
};
```

---
author: Albert
date: 2024-07-09
date created: 2024-06-14
tags:
  - Blog
  - Linux
title: Linux-对于BASH_SOURCE的理解
---


# Linux-对于BASH_SOURCE的理解

## 1. 使用场景

- 对于某个脚本 `some_script.sh` ，希望获取到该脚本所在的**绝对路径**
- 该脚本当中的其他文件，可以通过**脚本路径 + 相对位置**，拼接出完整的绝对路径
- 可以通过一行命令，获取脚本所在的绝对路径，内容如下:

```sh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
```

---

- 解读如下：
  1. `"${BASH_SOURCE[0]}"` 该变量可以获取到*该脚本 `source` 层次的第一层*
  2. `dirname` 获取该脚本所在目录的绝对路径
  3. 切换到该目录当中，并且输出路径，也就是需要获得的绝对路径

## 2. 为什么 `BASH_SOURCE` 是一个数组

- `"${BASH_SOURCE}` 变量是 `bash` 提供的保留变量，用以提供 **`source`层次** 。这种说法听上去是抽象的，所以用一个具象的例子来说明可能更好。
- 目录结构如下：

```sh
tree .
.
├── a.sh
└── b.sh
```

- `a.sh` 内容如下：

```sh
cat a.sh
echo "A"

source "./b.sh"

echo "A: ${BASH_SOURCE[@]}"
```

- `b.sh` 内容如下：

```sh
cat b.sh
echo "B"

echo "B: ${BASH_SOURCE[@]}"
```

- 换言之，`source` 的层次是 `b --> a --> user`，那么，执行 `bash a.sh` 结果如下：

```sh
# bash a.sh
A
B
B: ./b.sh a.sh
A: a.sh
```

- `b.sh` 被 `a.sh` 执行 `source`，那么其输出的数组**体现从内而外的 `source` 执行顺序（或者说执行层次）**


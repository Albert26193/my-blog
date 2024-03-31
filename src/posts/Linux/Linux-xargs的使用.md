---
author: Albert
date: 2024-02-22
date created: 2023-05-09
date updated: 2023-08-12 01:10
description: info
tags:
  - Blog
  - Linux
  - Command
title: Linux-xargs的使用
---

# Linux-xargs的使用

## 1. xargs作用

- 读取列表或者指定文件当中的一系列字符串，将其作为某个命令的输入参数
- 用来解决大批量的文件处理问题
- **把前面的参数，每遍历一次就交给后面的命令去执行一次**

## 2. 批量创建文件

- 给定一个列表，按照列表里面的名称创建文件

```shell
files_to_create=(001.txt 002.txt 003.txt)
printf "%s\n" "${files_to_create[@]}" | xargs touch
```

- 相当于如下命令

```shell
touch 001.txt 002.txt 003.txt 004.txt
```

## 3. 批量删除文件

- 给定一个列表，批量删除列表当中的文件

```shell
#!/bin/bash
files=(001.txt 002.txt 003.txt)
printf "%s\n" "${files[@]}" | xargs rm
```

- 相当于如下命令

```shell
rm 001.txt 002.txt 003.txt
```

## 4. 替换字符的用法

### 4.1 `-I`参数

- `xargs -I {} ls {}`表示使用自定义的替换字符串，比如`{}`，而不是空白字符来分隔输入。
- 上面的命令可以看成两个部分，第一个部分就是 `xargs -I {}`表示使用自定义替换字符串`{}`
- `ls {}`表示替换出来的结果被放到了 `{}`位置上，供`ls`执行。

```shell
echo "dir1 dir2 dir3" | xargs -I {} ls {}

# or
files=(001.file 002.file 003.file)
printf "%s\n" "${files[@]}" | xargs -I {} stat {}
```

### 4.2 `-0`参数

- `xargs -0`表示把空字符作为分隔符
- 一般和 `print0`结合使用，比如希望删除 特定字符串开头的字符

```shell
find . -type f -name 'tmp*' -print0 | xargs -0 rm -f
```

---

> [!AI]
> 例如，假设你有一个名为 file with spaces.txt 的文件，你想用 ls 命令查看它的详细信息。你可能会尝试使用下面的命令：

```sh
echo "file with spaces.txt" | xargs ls
```

- 但是，xargs 命令会把 file, with, 和 spaces.txt 作为三个不同的输入项，然后对每一个输入项执行 ls 命令。
- 为了解决这个问题，可以使用 -0 选项，让 xargs 命令使用 null 字符作为输入项之间的分隔符。由于文件名不能包含 null 字符，所以这样可以确保 xargs 命令能正确地处理任何文件名。
- 这是一个例子：

```sh
echo -n "file with spaces.txt" | tr '\n' '\0' | xargs -0 ls
```

- 在这个例子中，`echo -n` 命令会输出文件名，`tr '\n' '\0'` 命令会把换行符替换为 `null` 字符，然后 `xargs -0` 命令会把 `null` 字符作为输入项之间的分隔符，并对每一个输入项执行 `ls` 命令。这样，即使文件名包含了空格，命令也能正确地执行.

### 4.3 `-d`参数

- `xargs -d '\n'`，表示以换行符作为分隔

```shell
ls | grep '^tmp' | xargs -d '\n' rm -f
```

### 4.4 `-n1` 参数

- `xargs -n1` , 表示将每一个单词视为独立参数
- 比如经典的力扣 `shell` 编程题：[192. 统计词频 题解 - 力扣（LeetCode）](https://leetcode.cn/problems/word-frequency/solutions/2266542/tong-ji-ci-pin-3chong-jie-fa-xargs-awk-t-fwf2/)
- 给定一张记录了众多单词的 `txt` 文本，单词中间用空格隔开，统计各个单词的频率
- 利用 `xargs` 单行命令执行如下

```sh
cat words.txt | xargs -n1 | sort | uniq -c | sort -nr | awk '{print $2, $1}'
```

- `xargs -n1` 表示将

### 4.5 不加参数

- 可以将输出的结果从分散的多行合并成一行
- 比如执行 `ls -l | xargs`

```sh
ls -l | xargs
total 48 drwxr-xr-x@ 57 albertwang staff 1824 Aug 11 23:24 archive_20230811 -rwxr-xr-x@ 1 albertwang staff 71 Aug 11 23:28 file.txt -rw-r--r--@ 1 albertwang staff 57 Aug 11 23:46 file1.txt -rw-r--r--@ 1 albertwang staff 26 Aug 11 23:56 file2.txt -rwxr-xr-x@ 1 albertwang staff 151 Aug 11 23:35 lc_print_ten.sh -rwxr-xr-x@ 1 albertwang staff 235 Aug 12 00:45 lc_trans.sh -rw-r--r--@ 1 albertwang staff 254 Aug 12 01:06 lc_trans2.sh
```

- 结合 `awk` 多行拼接成一行

```sh
    awk '{print $'"$i"'}' "${originFile}" | xargs
```

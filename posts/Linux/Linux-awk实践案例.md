---
author: Albert
date: 2024-02-22
date created: 2023-08-08
date updated: 2023-08-13 11:53
description: Linux常用命令
tags:
  - Blog
  - Linux
  - Command
title: Linux-awk实践案例
---

# Linux-awk实践案例

## 1. 统计 `words.txt` 频率最高的单词

- `words.txt` 格式如下；

```sh
the day is sunny the the
the sunny is is
```

- 输出要求：
  1. 统计所有单词的频率，不允许有重复
  2. 先单词，后频率，单词和数字之间空一格

---

- 解答如下

```sh
# for every line, execute below content
{
  for (i = 1; i < NF; i++) {
    words_records[$i] += 1
  }
}

# execute all lines
END {
  for (word in words_records) {
    print word, words_records[word]
  }
}
```

- `words_records` 类似全局变量，每执行一行，就记录一次
- `$` 可以理解成一个运算符，取出对应列当中的内容

## 2. 按照类型切分 `netstat.txt`

```sh
#!/usr/bin/awk

NR != 1 {
  if ($6 ~ /TIME|ESTABLISHED/) {
      print > "./5.split/1.txt"
  } else if ($6 ~ /LISTEN/){
      print > "./5.split/2.txt"
  } else {
      print > "./5.split/3.txt"
  }
}
```

- 写法基本上和 `C` 差不错

## 3. 打印 `ls -al` 的结果

- 在 `mac` 系统下，执行 `ls -al` 结果如下：
  ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230920193547.png)

- 利用 `awk` 打印最后一列，结果如下：
  ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230920194208.png)

---

```shell
ls -al | awk '{print $NF}' | tail -n +4
```

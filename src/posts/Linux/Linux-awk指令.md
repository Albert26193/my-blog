---
author: Albert
category: CS-基础
date: 2024-02-22
date created: 2023-05-09
date updated: 2023-08-12 13:23
description: Linux常用命令
tags:
  - Blog
  - Linux
  - Command
title: Linux-awk指令
---

# Linux-awk指令

## 1. 使用场景

### 1.1 截断history输出

- 比如在`bash`编程当中，需要取一些`history`出来
- 但是`history command`的形式如下：`1 xxxx_command`，需要截断前面的数字

```shell
local selected_command=$(history | fzf | awk '{$1=""; print $0}' | tr -d '\n')
```

- 怎么理解上面的命令
  - `awk`本质上相当于`awk`语言的解释器
  - 执行`'{$1=""; print $0}'`
    - `$1`：第一列设置为空，等于去掉数字索引字符
    - `$0`：打印一整行
  - `tr`：相当于 _transliterate（转写）_ 的缩写，目的在于去掉换行符

### 1.2 检索文件特定字段

- 比如需要检测某个文件，是否有形如`url：xxxxxx`的行，可以如下操作

```shell
url=$(awk '/url:/ {print $2}' ${absolute_file_path})
```

- `/url: /`: 匹配包含`url: `的行
- 该行的格式默认其实是`url: xxxxxxxx`，那么`$2`对应的其实就是`xxxxxx`（相当于第二列）

---

- 再比如，需要匹配以`#`开头的行

```shell
title=$(awk '/^# / {print $0; exit}' ${absolute_file_path})
```

- 这里的`exit`说明匹配到第一次就`exit掉`

---

- 再比如，需要匹配只包含`---`行（匹配出现的第二次，因为需要获取到yaml结束行号）

```shell
# NR 是行号
awk_script='
/^---$/ {
  count++;
  if (count == 2) {
    print NR;
    exit;
  }
}'

end_yaml_line=$(awk "${awk_script}" "${file_name}")
```

### 1.3 结合目录

```sh
ls | awk '{print $0}'
```

- 打印出来的结果类似于 `ls -l`，多行输出
- 因为 `ls` 默认的 `IFS` 是 `/n` ，因此可以被 `awk` 输出

## 2. 基本功能

> [!info]
>
> - 该部分主要内容参考：[AWK 简明教程 | 酷 壳 - CoolShell](https://coolshell.cn/articles/9070.html)
> - 该部分的样例文件 `netstat.txt` 如下所示：
>
> Proto Recv-Q Send-Q Local-Address Foreign-Address State
> tcp 0 0 0.0.0.0:3306 0.0.0.0:\* LISTEN
> tcp 0 0 0.0.0.0:80 0.0.0.0:\* LISTEN
> tcp 0 0 127.0.0.1:9000 0.0.0.0:\* LISTEN
> tcp 0 0 coolshell.cn:80 124.205.5.146:18245 TIME_WAIT
> tcp 0 0 coolshell.cn:80 61.140.101.185:37538 FIN_WAIT2
> tcp 0 0 coolshell.cn:80 110.194.134.189:1032 ESTABLISHED
> tcp 0 0 coolshell.cn:80 123.169.124.111:49809 ESTABLISHED
> tcp 0 0 coolshell.cn:80 116.234.127.77:11502 FIN_WAIT2
> tcp 0 0 coolshell.cn:80 123.169.124.111:49829 ESTABLISHED
> tcp 0 0 coolshell.cn:80 183.60.215.36:36970 TIME_WAIT
> tcp 0 4166 coolshell.cn:80 61.148.242.38:30901 ESTABLISHED
> tcp 0 1 coolshell.cn:80 124.152.181.209:26825 FIN_WAIT1
> tcp 0 0 coolshell.cn:80 110.194.134.189:4796 ESTABLISHED
> tcp 0 0 coolshell.cn:80 183.60.212.163:51082 TIME_WAIT
> tcp 0 1 coolshell.cn:80 208.115.113.92:50601 LAST_ACK
> tcp 0 0 coolshell.cn:80 123.169.124.111:49840 ESTABLISHED
> tcp 0 0 coolshell.cn:80 117.136.20.85:50025 FIN_WAIT2
> tcp 0 0 :::22 :::\* LISTEN

### 2.1 内置符号

| \$0      | 当前记录（这个变量中存放着整个行的内容）                                      |
| :------- | :---------------------------------------------------------------------------- |
| \$1~\$n  | 当前记录的第n个字段，字段间由FS分隔                                           |
| FS       | 输入字段分隔符 默认是空格或Tab                                                |
| NF       | 当前记录中的字段个数，就是有多少列                                            |
| NR       | 已经读出的记录数，就是行号，从1开始，如果有多个文件话，这个值也是不断累加中。 |
| FNR      | 当前记录数，与NR不同的是，这个值会是各个文件自己的行号                        |
| RS       | 输入的记录分隔符， 默认为换行符                                               |
| OFS      | 输出字段分隔符， 默认也是空格                                                 |
| ORS      | 输出的记录分隔符，默认为换行符                                                |
| FILENAME | 当前输入文件的名字                                                            |

- `awk` 当中，`Fields` 被定义为*列*， `Records` 被定义为*行*
- `NF`: `Number of Fields` 列的总量
- `NR`: `Number of Records` 行的总量
- `FS`：`Fields Separator` 使用什么符号来区分列
- `RS`: `Records Separator` 使用什么符号来区分行
- `OFS`: `Outpt Fields Separator` 使用什么符号在*输出的时候*作为行的分隔符（你希望输出是什么样子的），必须显式 `print`，`OFS` 的设置才生效
- 指定多个分隔符：`awk -F '[;:]' `
- demo 如下

```sh
awk -F: '{print $1,$3,$6}' ORS="\t end \n" OFS="\t****\t" /etc/passwd
```

- 如果需要打印最后一列（这和 `ls -l` 命令的配合是**非常常见的**）

```sh
ls -l | awk '{print $NF}' | tail -n +2
```

### 2.2 正则模式匹配

- 匹配方式一定程度上类似 `grep`，例子如下

```sh
awk 'NR == 1 || /LISTEN/' netstat.txt
```

- 实际上，上面的例子省略了一些信息，其等价于

```sh
awk 'NR == 1 || $0 ~ /LISTEN/' netstat.txt
```

- 等价于，给一整行添加*规则为包含 ’Listen‘* 的正则匹配

---

- 如果想要给第 6 列添加正则规则，例子如下

```sh
awk 'NR == 1 || $6  ~ /LISTEN|ESTAB|FIN/ {print $6}' OFS="  ==== " netstat.txt
```

---

- 如果需要反向匹配，请使用 `!~` ，例子如下

```sh
awk '$6 !~ /WAIT/ || NR == 1 {print NR,$4,$5,$6}' ORS="    end \n" OFS="    |    "   netstat.txt
```

---

- 和 `ls / grep / xargs` 等命令可以自由配合
- 比如以下场景，我的目录打印出来的内容如下
  ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230807191234.png)
- 我只想保留 `1.split_by_filed.sh` 和 `netstat.txt` 这两个文件，其他文件都想删除掉
- 执行命令如下

```sh
ll | awk '{print $NF}' | tail -n +2 \
| grep -vE '1\..*|.*\.txt' \
| xargs -I {} rm -r {}
```

### 2.3 拆分文件

- 安装第6列的类别，将其分类成数个不同的文件，命令如下

```sh
# 不拆分表头
awk 'NR!=1{print > "./split_1/"$6}' netstat.txt
```

- `$6` 有如下几种可能的分类 `ESTABLISHED` `FIN_WAIT1` `FIN_WAIT2` `LAST_ACK` `LISTEN` `TIME_WAIT`
- 注意，`$6` 需要写在双引号外面，写在里面就会被当成普通字符串
- 执行结果如下所示
  ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230807192017.png)

### 2.4 统计频次

```sh
awk 'NR!=1{a[$6]++;} END {for (i in a) print i ", " a[i];}' netstat.txt
```

- 一般像这种建议直接写成多行脚本，将 `awk` 脚本的内容提取成单独的变量

### 2.5 字符串拼接

- 将多个列添加到 `content` 当中去。

```awk
    for(i=3; i<=NF; i++) {
        content=content$i
    }
```

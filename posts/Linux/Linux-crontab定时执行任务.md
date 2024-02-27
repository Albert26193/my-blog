---
author: Albert
date: 2024-02-22
date created: 2023-05-09
date updated: 2023-06-20 18:25
description: Linux基本常识
link: https://www.notion.so/Linux-Crontab-bbea06203a1e4d1988f27dda554d095c
notionID: bbea0620-3a1e-4d19-88f2-7dda554d095c
tags:
  - Linux
  - Command
title: Linux-crontab定时执行任务
---

# Linux-crontab定时执行任务

## 1. `crontab` 表项

- Crontab 是 Linux 系统中的一个任务定时执行的工具，它允许用户在指定时间间隔内运行命令或脚本。它通常用于执行系统维护任务或定期备份数据等。

```scss
*     *     *     *     *  command to be executed
-     -     -     -     -
|     |     |     |     |
|     |     |     |     +----- day of the week (0 - 6) (Sunday = 0)
|     |     |     +------- month (1 - 12)
|     |     +--------- day of the month (1 - 31)
|     +----------- hour (0 - 23)
+------------- min (0 - 59)

```

> [!cite]
> 每个时间参数可以指定一个值、一组值、连续的值或者通配符。
>
> - 例如，\* 表示该参数所有可能的值都符合条件，例如 \* \* \* \* \* 表示每分钟执行一次命令。
> - 如果想要指定多个值，可以使用逗号分隔 ,例如 0,15,30,45 \* \* \* \* 表示每小时的 0、15、30、45 分钟执行一次命令。
> - 如果想要指定连续的一段值，可以使用短横线 -，例如 10-20 \* \* \* \* 表示每小时从 10 到 20 分钟之间每分钟执行一次命令。

## 2. `crontab` 执行定时任务

- 以定时执行访问 openAI 为例，需要定时访问 API， 以免账号被风控，那么，bash 脚本如下

```shell
#!/bin/bash

# set url
API_URL="https://api.openai.com/v1/organizations"
TOKEN="sk-xxxxxxxxxxxxxxxxxxxxxx"

# 使用curl命令访问OpenAI账号
current_dir="/Users/albert/auto_script/vis_gpt/"
log_file=${current_dir}gpt_history.log

curl -s -H "Authorization: Bearer $TOKEN" $API_URL >> ${log_file}
echo "访问时间：$(date)" >> ${log_file}
echo "------------------------------" >> ${log_file}

# 打印访问日志
openai_log_file=${current_dir}openai.log
echo "OpenAI账号已访问 $(date)" >> ${openai_log_file}
```

- **注意，必须使用绝对路径**

- `crontab -e` 进行编辑，比如希望每过 8 个小时执行一次

```shell
0 */8 * * * /path/to/helloworld.sh
```

## 3. 查看 `crontab` 的现有表项

```shell
crontab -l
```

## 4. 一个容易忽视的问题

- `crontab` 只认识绝对路径，**_相对路径是不管用的_**

---
author: Albert
date: 2024-03-03
date created: 2023-05-09
date updated: 2023-04-16 18:05
tags:
  - Blog
  - Linux
  - Bash编程
title: Linux-bash脚本当中数组的使用
---

# Linux-bash脚本当中数组的使用

## 1. 初始化数组

```shell
# arry_name=(element1 element2 element3)
my_array=("apple" "orange" "banana" "peach")
```

## 2. 循环访问

- 直接写数组

```shell
for i in 1 2 3 4 5
do
  echo ${i}
done
```

- 利用`@`或者`*`获取到整个数组，`${fruit}`只能获取到第一个元素

```shell
fruit=("apple" "orange" "banana" "grape")

# 访问整个数组
echo ${fruit[@]}  # 输出 "apple orange banana grape"
echo ${fruit[*]}  # 输出 "apple orange banana grape"

# 访问数组的第一个元素
echo ${fruit}     # 输出 "apple"
echo ${fruit[0]}  # 输出 "apple"
```

- 利用`for`循环遍历

```shell
fruit=("apple" "orange" "banana")
for item in ${fruit[*]}
do
  echo $item
done
```

- 利用`while`遍历数组

```shell
while [[${index} -lt ${#fruit[@]}]]
do
  echo ${fruit[$i]}
  ((i++))
done
```

- 类`C`风格遍历

```shell
for((i=0; i<${#fruit[@]}; i++))
do
  echo ${fruit[$i]}
done
```

## 3. 获取长度

```shell
echo ${#fruit[@]}
```

## 4. 获取下标

```shell
for index in ${!fruit[@]}
do
  echo ${fruit[$index]}
done
```

## 5. 恰当的`$`

```shell
$fruit[num]
# 内部的num可以不用加上$符号
```

## 6. 如何去除数组元素

```shell
$fruit[index]=""
```

## 7. 检查元素是否在数组当中

```shell
if [[ ! " ${selected_files[@]} " =~ " $file " ]]; then
```

![image.png|425](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230228164758.png)

## 8. `@`和`*`的区别

- `@`会把数组对象当中的每一个单词，当成 **独立单词** 去处理，函数如果接受数组，那么就会把每个元素当成独立的参数
- `*`会把数组对象当成 **整体的字符串** 去处理，如果传入到函数当中，数组就会变成一个完整的字符串。

## 9. 数组作为函数参数

- 如果将 `array[@]`作为函数形参传入某个函数`fun1`当中，那么，`fun1`就会将其解析成多个参数，从而出错
- 正确的做法
  - 1. 在传形参的时候， 使用 `fun1 "${array[*]}"`, 将整个数组作为**整一个字符串**传入目标函数。
  - 2. 在`fun1`内部，应该做如下解析 `local fun1_array=("$1")`, 将 **整体字符串重新变成数组**

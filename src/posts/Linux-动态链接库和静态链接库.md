---
author: Albert
date: 2024-02-22
date created: 2023-05-09
tags:
  - Blog
  - OS
  - interview
title: Linux-动态链接库和静态链接库
---

# Linux-动态链接库和静态链接库

> https://www.zhihu.com/question/20484931

## 1. 为什么需要库？

> 库是写好的现有的，成熟的，可以复用的代码。现实中每个程序都要依赖很多基础的底层库，不可能每个人的代码都从零开始，因此库的存在意义非同寻常。
> 库从本质上说，就是一系列可执行代码的二进制形式，能够被操作系统载入内存执行。

- 库的存在就是为了**代码复用**
- 为什么不直接引用，比如头文件？
- 一系列文件需要组织起来，**便于调取**
- 比如`LeetCode`刷题需要用到的一系列头文件和cpp文件，需要将其编译成一个静态库，以便调用
  ![image.png|350](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230115165356.png)
- 静态库：`.a`，`.lib`
- 动态库：`.so`, `.dll`

## 2. 程序编译的过程

```shell
g++ -c hellospeak.cpp
```

- 这段代码的`-c`,指示`gcc`，不仅需要执行链接，输出结果为对象文件，`.o`结尾的是对象文件。

---

```shell
g++ hellospeak.cpp speak.cpp -o hellospeak
```

- 这段代码将两个源码文件编译链接成一个单一的可执行程序
- 如果没有`-o`参数，编译器采用默认的`a.out`

---

![image.png|475](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230115170249.png)

- 静态库和动态库的区别在于，在*链接*这个环节，如何处理库，使之成为可执行程序，二者分别是动态链接方式和静态链接方式。

## 3. 静态库

- 静态链接库可以看成一系列可执行的目标文件`.o`文件的集合。
- 在链接阶段，将汇编生成的目标文件`.o`和用到的库一起链接打包到可执行文件当中
- 静态库的特点如下
  - 静态库对于函数库的链接是放在编译时期完成的
  - 程序运行起来之后，和函数库就没有关系了，移植方便
  - 对于空间和时间都是浪费，因为所有目标相关的文件和函数库都要被链接成一个可执行文件

### 3.1 Linux下静态库的创建和使用

- 必须形如`lib[your_library_name].a`前后的命名都是固定的
- 创建流程
  - 可以手动创建
  - 也可以通过`CMake`创建，请参考[CMake Demo](https://github.com/wzpan/cmake-demo)
- 如果多个不同的程序都用同一个静态库，比如2000个不同的程序，那么静态库就会复制2000份，内存开销也是2000倍。
  ![image.png|450](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230115180907.png)
- 静态库的另外一个问题就是**_发布更新非常困难_**，比如说静态库`libTest.a`更新了，那么所有使用它的应用程序必须编译。因为**静态库对于函数库的链接是编译时完成的\***，所以需要重新编译发布。比如一个游戏，上游静态库可能只是一个很小的变动，但是对于用户来说，需要完整下载整个游戏。

## 4. 动态库

- 基于静态库的弱点，提出了动态库。
- **动态库不参与程序编译的过程**，只有在程序运行的时候才会被载入。
- 如果不同的应用程序调用相同的库，_内存当中只有一份库的实例_
- 对于软件发布来说，是可以*增量更新*的
  ![image.png|450](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2022-11/20230115181422.png)
- 特点
  - 将库函数的载入放在了*运行* 阶段
  - 实现进程之间的资源共享
  - 让程序升级变得简单
  - 链接载入完全由程序员在程序代码当中控制（显示调用）

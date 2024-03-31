---
author: Albert
date: 2024-02-22
date created: 2023-05-09
date updated: 2023-10-10 14155 20:19
description: JS基础知识
tags:
  - JS
  - interview
title: JS-闭包面试题
---

# JS-闭包面试题

## 1.  question-1

>  【闭包【JS面试题】】 https://www.bilibili.com/video/BV1jV411H7Pi/?share_source=copy_web&vd_source=eeddb1cedc60b3f7a4bdeeffebc5d786

- 什么是闭包？
  - 闭包就是一个函数和它周围状态的引用捆绑在一起的组合。
- 题目（函数作为返回值）

```js
function test() {
  const a = 1;
  return function() {
    console.log('a', a);
  }
}

const fn = test();
const a = 2;
fn();
```

- 答案：`logs: a 1` ，因为返回值函数当中的`a`，按照作用域链[[../原型链/JS-作用域链]]，具有3个变量对象。
  - 1. 匿名函数本身的变量对象
  - 2. 其父级函数`test`的变量对象
  - 3. 全局的变量对象
- `const`和`let`类似，本质上从属于块级作用域，因此，`test`内部的`const a`和全局的`const a`本质上是两个变量，调用`fn`的时候，访问的上下文环境，是`test`函数返回的匿名函数的上下文环境，因此，输出的`a`为1

## 2. question-2

> 【闭包【JS面试题】】 https://www.bilibili.com/video/BV1jV411H7Pi/?share_source=copy_web&vd_source=eeddb1cedc60b3f7a4bdeeffebc5d786

- 题目（函数作为参数）

```js
function test(fn) {
  const a = 1;
  fn();
}

const a = 2;
function fn() {
  console.log('a', a);
}
```

- 输出结果为2
- 因为`fn`函数的上下文环境，**是其被*定义*时的上下文环境，而非被*执行*时的上下文环境**。

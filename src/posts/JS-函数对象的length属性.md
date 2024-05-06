---
author: Albert
date: 2024-02-22
date created: 2023-08-10
tags:
  - Blog
  - JS
  - interview
  - Frontend
title: JS-函数对象的length属性
---

# JS-函数对象的length属性

## 1. 来自 `MDN` 的定义

- `length` 表示函数期望的参数数量
- 剩余参数 `rest` 的数量不纳入 `length` 进行计算
- `length` _只统计第一个具有默认参数之前的参数数量_
- `Fuction` 构造函数本身也是一个 `Function` 对象，它的 `length` 为 `1`
- `Function.prototype.length` 为 `0`

## 2. 和 `arguments.length` 的区别

- `arguments.length` 来自于函数内部，表示实际接收到的参数数量
- `somFunc.length` 表示期望传递给函数的参数数量

## 3. demo代码

```js
if (0) {
  console.log(Function.length) // 1

  console.log((() => {}).length) // 0
  console.log(((a) => {}).length) // 1
  console.log(((a, b) => {}).length) // 2，依此类推

  console.log(((...args) => {}).length)
  // 0，剩余参数不计算在内

  console.log(((a, b = 1, c) => {}).length)
  // 1，只计算第一个具有默认值的参数之前的参数
}

if (1) {
  function fun1(a) {} // 0
  function fun2(b = 'a', a) {} //0
  function fun3(a, b = 'a') {} // 1
  function fun4(a, ...arr) {} // 1

  console.log(fun1.length, 'func1')
  console.log(fun2.length, 'func2')
  console.log(fun3.length, 'func3')
  console.log(fun4.length, 'func4')
}
```

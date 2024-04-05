---
author: Albert
date: 2024-02-22
date created: 2023-12-25
date updated: 2023-10-30 12:14
description: JS基础知识
tags:
  - Blog
  - JS
  - Frontend
title: JS-ES6-变量提升和暂时性死区
---

# JS-ES6-变量提升和暂时性死区

> [ES6 标准入门（第2版）-阮一峰-微信读书](https://weread.qq.com/web/reader/d2432530813ab7c05g019f02k45c322601945c48cce2e120)

## 1. 什么是变量提升

[[../基础/Object/JS-变量提升|JS-变量提升]]

- 在代码执行之前，_JavaScript 引擎会将变量声明（但不包括赋值）提升到函数或全局作用域的顶部。_
- 这意味着在变量被声明之前，它们就可以被访问和使用。
- 只有声明会被提升，而不包括初始化或赋值。这意味着变量在代码中的实际声明位置之前可以被引用，但它们的值将是 `undefined`。当代码执行到变量声明的位置时，变量会被赋予实际的值。

---

- 比如下面的代码：

```js
console.log(x) // 不报错，只是 undefined
var x = 100
console.log(x) // 100
```

## 2. `let` 不允许变量提升/重复声明

- `ES6` 规定了 `let/const` 不允许进行变量提升
- 同时规定了 `let/const` 不允许重复声明

## 3. 什么是暂时性死区

- 暂时性死区 `temporal dead zone` （`TDZ`）
- `let` 能够在*块级作用域*内形成*暂时性死区*
- 只要作用域内存在 `let` 关键字，它所声明的变量就**绑定了这个区域，不受外部影响**
- 比如下面的代码

```js
var temp = 123

if (1) {
  temp = 'abc' // Reference Error
  let temp
}
```

- 在 `if(1)` 所形成的块级作用域内，`let` 声明的变量绑定了这个区域，不受外部影响。换言之，**在 `let` 声明变量前，无论外部是否声明 `temp` 变量，这个变量均不可用。**

---

```js
if (1) {
  // >>>>>> 暂时性死区开始
  temp = 'abc'
  console.log(temp)
  temp += 'd'

  // >>>>>>> 暂时性死区结束
  let temp
  console.log(temp) // undefined
}
```

- 在 `temp` 变量通过 `let` 声明之前，所有的区域都是暂时性死区。

---

- 部分的暂时性死区不容易发现，比如下面的代码

```js
function bar(x = y, y = 2) {
  return [x, y]
}

bar() // Reference Error
```

- 报错原因在于，在函数形成的块级作用域内，`x = y` 赋值的时候，`y` 的值并不确定，或者说，在 `y = 2` 语句执行前都属于暂时性死区。
- 下面的代码可以正常执行，效果比较好

```js
function bar(x = 2, y = x) {
  return [x, y]
}

bar() // [2, 2]
```

---

- 总结 ：**暂时性死区的本质就是，只要一进入当前作用域，所要使用的变量就已存在，但是不可获取，只有等到声明变量的那一行代码出现，才可以获取和使用该变量。**

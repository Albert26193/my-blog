---
author: Albert
date: 2024-02-22
date created: 2023-09-14
date updated: 2023-09-14 17:46
description: JS基础知识
tags:
  - Blog
  - JS
  - interview
  - front-end
title: JS-生成器
---

# JS-生成器

## 1. 概念梳理

### 1.1 生成器对象

- 符合迭代器协议和可迭代协议
- 通过调用*生成器函数* 返回

### 1.2 生成器函数

- 如下代码所示

```js
function* generator(i) {
  yield i
  yield i + 10
}

const gen = generator(10)

console.log(gen.next().value)
// Expected output: 10

console.log(gen.next().value)
// Expected output: 20
```

- 特点：
  - 能够暂时中断函数的执行，然后从暂停处继续
  - 通过 `yield` 运算符，能够产生 _生成器对象_，该对象适配可迭代协议，换言之，该对象具备 `next()`方法，能做通过调用该方法，
  - 调用一个生成器函数并不会马上执行它里面的语句，而是返回一个这个生成器的 迭代器 （ iterator ）对象。当这个迭代器的 next() 方法被首次（后续）调用时，其内的语句会执行到第一个（后续）出现yield的位置为止，yield 后紧跟迭代器要返回的值。

### 1.2 `yield` 运算符

- 在 JavaScript 中，生成器（Generator）是一种特殊类型的函数，它可以产生多个结果。生成器函数使用 function\* 关键字定义，并且可以包含一个或多个 yield 表达式。
- yield 是一个关键字，它使得生成器函数可以暂停和恢复执行。当生成器函数遇到 yield 表达式时，它会返回一个结果，并将函数的状态设置为暂停。当 next 方法再次被调用时，生成器函数将从暂停的地方恢复执行。

## 2. 生成器函数的参数

- 观察以下代码
- 调用 `next()` 方法时，如果传入了参数，那么这个参数会传给上一条执行的 `yield` 语句左边的变量。

```js
function* gen() {
  yield 10
  x = yield 'foo'
  yield x
}

var gen_obj = gen()
console.log(gen_obj.next()) // 执行 yield 10，返回 10
console.log(gen_obj.next()) // 执行 yield 'foo'，返回 'foo'
console.log(gen_obj.next(100)) // 将 100 赋给上一条 yield 'foo' 的左值，即执行 x=100，返回 100
console.log(gen_obj.next()) // 执行完毕，value 为 undefined，done 为 true
```

---

- 比如下面的代码

```js
function* createIterator() {
  let first = yield 1
  let second = yield first + 2 // 4 + 2
  // first =4 是 next(4) 将参数赋给上一条的
  yield second + 3 // 5 + 3
}

let iterator = createIterator()

console.log(iterator.next()) // "{ value: 1, done: false }"
console.log(iterator.next(4)) // "{ value: 6, done: false }"
console.log(iterator.next(5)) // "{ value: 8, done: false }"
console.log(iterator.next()) // "{ value: undefined, done: true }"
```

## 3. 生成器函数的应用

- 将多维数组展开成一维数组

```js
function* iterArr(arr) {
  //迭代器返回一个迭代器对象
  if (Array.isArray(arr)) {
    // 内节点
    for (let i = 0; i < arr.length; i++) {
      yield* iterArr(arr[i]) // (*) 递归
    }
  } else {
    // 离开
    yield arr
  }
}
// 使用 for-of 遍历：
var arr = ['a', ['b', 'c'], ['d', 'e']]
for (var x of iterArr(arr)) {
  console.log(x) // a  b  c  d  e
}
// 或者直接将迭代器展开：
var arr = ['a', ['b', ['c', ['d', 'e']]]]
var gen = iterArr(arr)
arr = [...gen] // ["a", "b", "c", "d", "e"]
```

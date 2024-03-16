---
author: Albert
date: 2024-02-22
date created: 2023-07-10
date updated: 2023-07-10 16:00
description: JS基础知识
tags:
  - Blog
  - JS
  - interview
  - front-end
title: JS-关于稀疏数组和空槽机制
---

# JS-关于稀疏数组和空槽机制

## 1. 问题的起因

- 对如下代码的执行存在困惑
- 可以通过添加元素的方式改变 `array.length`
- 那么 `array.length` 的意义何在呢？

```js
// url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/length
// utils
const printArray = (someArray, index) => {
  console.log('---------print element---------')
  someArray.forEach((x) => console.log(typeof x))
  console.log(someArray)
  console.log('---------print index  ---------')
  console.log(index)
  console.log('val:', someArray[index], 'type:', typeof someArray[index])
  console.log('---------print length ---------')
  console.log(someArray.length)
  console.log('*******************************\n')
}

if (1) {
  const testArray1 = []
  const tempIndex1 = 100
  testArray1[tempIndex1] = 1
  printArray(testArray1, tempIndex1 - 2)
  printArray(testArray1, tempIndex1 + 2)

  //test 2^32
  const tempIndex2 = 2 ** 32
  testArray1[tempIndex2] = 1
  printArray(testArray1, tempIndex2 - 2)
  printArray(testArray1, tempIndex2 + 2)

  const tempIndex3 = 2 ** 32 - 2
  testArray1[tempIndex3] = 1
  // printArray(testArray1, tempIndex3 - 2)
  // printArray(testArray1, tempIndex3 + 2)
  console.log(testArray1)

  // testArray1.length = 2**32 // error
}
```

## 2. `length` 属性

- `MDN` 的文档当中对于 `length` 属性有着如下描述

> [!tip]
> 数组对象会观察 length 属性，并自动将 length 值与数组的内容同步。这意味着：
>
> - 设置 length 小于当前长度的值将会截断数组——超过新 length 的元素将被删除。
> - 设置超过当前 length 的任何数组索引（小于 $2^{32}$ 的非负整数）将会扩展数组——length 属性增加以反映新的最高索引。
> - 将 length 设置为无效值（例如负数或非整数）会引发 RangeError 异常。

| Writable     | yes |
| :----------- | :-- |
| Enumerable   | no  |
| Configurable | no  |

- 如果希望 `length` 有着更加更加严格的限制，可以在 `strict` 模式下将 `length` 属性描述符当中的 `writable` 设置为 `false`，代码如下

```js
'use strict'

const numbers = [1, 2, 3, 4, 5]
Object.defineProperty(numbers, 'length', { writable: false })
numbers[5] = 6 // TypeError: Cannot assign to read only property 'length' of object '[object Array]'
numbers.push(5) // // TypeError: Cannot assign to read only property 'length' of object '[object Array]'
```

- 在实现层面，`JavaScript` 实际上是将元素作为标准的对象属性来存储，把数组索引作为属性名。那么，`length` 属性本质上控制了 **哪些属性是可以被当做索引来访问**。数组的 `length` 大小在 `0-2^32 - 1` 之间

## 3. 空槽和稀疏数组

### 3.1 空槽机制和稀疏数组是什么？

- 当在数组中间删除元素时，会形成一个空位，这个空位就是所谓的 `empty slot`（空槽）。
- 含有空槽的数组就是 **稀疏数组**
- 空槽在部分方法中，会被视为 `undefined`，在另外的部分方法中，不会被这样看待。

### 3.2 为什么需要这么设计？

- 利用空槽可以保持数组的连续性。删除某个特定位置的索引之后，不会引起索引全部更新
- 这样做也可以提高性能。比如需要删除数组当中的大量元素，如果删除一个就重新计算索引，代价是非常大的。

### 3.3 内置方法怎么看待空槽？

- 一般而言，`Array.prototype` 当中支持函数式编程的接口，比如 `map/forEach/reduce/filter/every` 等，都会对空值进行 `in` 检查，**不会将空槽和 undefined** 合并。（所谓 `in` 检查，也就是不认为数组的空槽位置存在属性，方法会自动忽略空槽位置）
- 更加久远一些的方法，比如 `entries/fill/find` 等等，会将其当中 `undefined` 去对待（认为空槽位置存在属性，属性值就是 `undefined`）
- 如下代码所示：

```js
if (0) {
  // treat as undefined, 大部分是比较老的方法
  const testArray2 = [1, 2, , , 5] // Create a sparse testArray2ay

  // Indexed access
  console.log(testArray2[2]) // undefined

  // For...of
  for (const i of testArray2) {
    console.log(i)
  }
  // Logs: 1 2 undefined undefined 5

  // Spreading
  const another = [...testArray2] // "another" is [ 1, 2, undefined, undefined, 5 ]
}

// not treat as undefined, 绝大多数常用的Functional API都会进行in检查
if (0) {
  const testArray3 = [1, 2, 3]
  for (const prop in testArray3) {
    console.log(prop)
  }

  testArray3[100] = 1
  testArray3.forEach((x) => console.log(x))
}
```

### 3.4 如何构造空槽？

```js
// Array constructor:
if (1) {
  const a = Array(5) // [ <5 empty items> ]
  for (const i of a) {
    console.log(a[i])
  }

  // Consecutive commas in array literal:
  const b = [1, 2, , , 5] // [ 1, 2, <2 empty items>, 5 ]
  for (const i of b) {
    console.log(b[i])
  }

  // Directly setting a slot with index greater than array.length:
  const c = [1, 2]
  c[4] = 5 // [ 1, 2, <2 empty items>, 5 ]

  // Elongating an array by directly setting .length:
  const d = [1, 2]
  d.length = 5 // [ 1, 2, <3 empty items> ]

  // Deleting an element:
  const e = [1, 2, 3, 4, 5]
  delete e[2] // [ 1, 2, <1 empty item>, 4, 5 ]
}
```

- 通过构造函数、字面量、类似越界指定数组元素、显式修改 `length`、删除元素等方法都可以去构造空槽

### 3.5 如何检查空槽？

- 如下代码所示

```js
if (1) {
  function hasEmptySlot(array) {
    return !array.includes(undefined)
  }

  console.log(hasEmptySlot([1, 2, , 4])) // 输出: true
  console.log(hasEmptySlot([1, 2, 3, 4])) // 输出: false
}
```

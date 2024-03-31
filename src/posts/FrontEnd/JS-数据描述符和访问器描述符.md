---
author: Albert
date: 2024-02-22
date created: 2023-06-16
date updated: 2023-07-26 14:35
description: info
tags:
  - Blog
  - interview
  - JS
  - front-end
title: JS-数据描述符和访问器描述符
---

# JS-数据描述符和访问器描述符

> [!MDN]
>
> - 对象中存在的属性描述符有两种主要类型：**数据描述符** 和 **访问器描述符**。数据描述符是一个具有可写或不可写值的属性。访问器描述符是由 getter/setter 函数对描述的属性。描述符只能是这两种类型之一，不能同时为两者。
> - Link: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty

**\*为什么需要设计访问器属性？访问器属性的作用似乎完全可以通过方法去代替？**

## 1. 数据描述符

### 1.1 概述

- `data descriptor`
- 主要包括以下 4 个属性: `configurable` 、`enumerable` 、`writable`、`value` 。
- 其中，`configurable` 和 `enumerable` 属性是 **数据描述符** 和 **访问器描述符** 共有的公共属性。
- 可以通过 `Object.getOwnPropertyDescriptor` 静态方法观察

```js
if (1) {
  const obj = Object.defineProperties(
    {},
    {
      someProperty1: {
        value: 10,
        writable: true,
        enumerable: true,
        configurable: false
      }
    }
  )

  console.log(obj, Object.getOwnPropertyDescriptors(obj))
}
```

### 1.2 `writable` 属性

> [!MDN] > `writable`: 如果与属性相关联的值可以使用赋值运算符更改，则为 `true`。默认值为 `false`。

- 这个属性是 **数据描述符** 特有的，这一点很好理解，只有数据才有 `writable` 的意义。

### 1.3 `value` 属性

- 就是数据属性的具体数值
- 也是 **数据描述符** 特有的属性

## 2. 访问器描述符

- `accessor descriptor`
- `getter` 和 `setter`
- 具体代码如下

```js
if (1) {
  const obj2 = {
    name: 'Alice',
    age: 55
  }

  Object.defineProperty(obj2, 'phone', {
    value: 42
    // enumerable: true
  })

  Object.defineProperty(obj2, 'age', {
    get: function () {
      console.log('get it')
      return 55
    },

    set: function (newVal) {
      console.log('set it', newVal)
    }
  })

  // console.log(Object.getOwnPropertyDescriptors(obj2))
  console.log(obj2)
  // console.log(obj2.age)
  // obj2.age = 888
}
```

---

- 再次修改 `get` 和 `set` 都会出错，因为二者的属性是一个函数

```js
const obj = {}

Object.defineProperty(obj, 'name', {
  value: 'yancey',
  configurable: false
})

// Uncaught TypeError: Cannot redefine property: name
Object.defineProperty(obj, 'name', { get: function () {} })

// Uncaught TypeError: Cannot redefine property: name
Object.defineProperty(obj, 'name', { set: function () {} })
```

## 3. 数据描述符和 访问器描述符的公共属性

- `configurable` 属性：

> [!MDN] > `configurable`
> 当设置为 `false` 时，
>
> - 该属性的类型 **不能在数据属性和访问器属性之间更改**，且
> - 该属性不可被删除，且
> - 其描述符的其他属性也不能被更改（但是，如果它是一个可写的数据描述符，则 `value` 可以被更改，`writable` 可以更改为 `false`）。

```js
// configurable and writable
if (1) {
  const obj3 = { name: 'Eric' }
  Object.defineProperty(obj3, 'age', {
    value: 20,
    writable: true,
    enumerable: true,
    configurable: false
  })

  // if configurable: false but writable: true
  // you can still change the value
  obj3.age = 800
  console.log(obj3)

  /******************************************/
  // defineProperty can change the existing property, not redefine it
  //console.log(Object.getOwnPropertyDescriptor(obj3, 'age'))

  // if configurable is false, you can still change 'writable' from 'true' to 'false'
  // but can not from 'false' to 'true'
  Object.defineProperty(obj3, 'age', {
    value: 8,
    writable: false,
    configurable: false
  })
  console.log(obj3)

  // error: can not change writable from 'false' to 'true', if 'configurable' is 'false'
  /*
  Object.defineProperty(obj3, 'age', {
    value: 100,
    writable: true
  })
  */
}
```

- 如果 `configurable` 是 `false` ，那么 `writable` 只能从 `true` 变成 `false` ，换言之，**`configurable` 是 `false` 的情况下，只允许变得更加严格，不允许变得宽松**

---

- `enumerable` 属性
  - 如果 `enumerable` 属性设置为 `false`，那么该属性在 `for...of` 等迭代就会被忽略，注意，**`console.log` 的输出本质上也是一种迭代**，因此，如果某个属性的 `configurable` 属性被设置为 `false`，那么 `console` 也不会将其输出。

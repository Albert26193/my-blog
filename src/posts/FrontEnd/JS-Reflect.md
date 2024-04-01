---
author: Albert
date: 2024-02-22
date created: 2023-12-25
date updated: 2023-10-10 12:41
tags:
  - Blog
  - JS
  - front-end
title: JS-Reflect
---

# JS-Reflect

## 1. 什么是 `Reflect`

- `ES6` 标准引入的一个**全局对象**，提供了一系列用于**操作对象**的方法。
- 这些方法可以便捷地实现对于 `JS` 的**内部操作**

> [!ai] >`Reflect` 的主要目标是：
>
> 1.  _整合_：JavaScript 语言中的内部操作变得更为一致。例如，之前 `Object.defineProperty()` 在失败时抛出异常，而赋值操作则返回 `false`。使用 `Reflect.defineProperty()` 和 `Reflect.set()`，这两种操作在失败时都会返回 `false`。
> 2.  _扩展能力_：某些方法（如 `Reflect.apply()` 和 `Reflect.construct()`）提供了对旧有功能的更为灵活的调用方式。
> 3.  _更好的代理支持_：`Reflect` 和 `Proxy API` 配合得很好，让创建代理对象变得更简单、更一致。

## 2. `Reflect` 的应用场景

### 2.1 利用 `Reflect` 判断对象为空

- 利用 `Reflect` 判断对象是否为空是最佳方式

```js
function isEmpty(obj) {
  return Reflect.ownKeys(obj).length === 0
}

console.log(isEmpty({})) // true
console.log(isEmpty({ a: 1 })) // false
```

- `Object.keys(obj)` 返回对象所有**可枚举的自有属性**。如果有**非枚举属性或者符号属性，那么将不会被考虑**。
- `Object.getOwnPropertyNames(obj)` 返回对象的**所有自有属性**，无论是否可枚举。但是并不考虑符号属性。
- `Reflect.ownKeys(obj)`: 返回对象的**所有自有属性，包括不可枚举属性和符号属性**。

### 2.2 和 `Proxy` 配合

- `Proxy` 允许开发者创建一个“代理”对象，从而拦截自定义对象的*基本操作*（比如属性读取，属性设置，函数调用等等）。
- 这些*基本操作*，`Proxy` 和 `Reflect` 设计成一一对应的，`Proxy` 负责拦截， `Reflect` 可以在拦截之后，将 `Reflect` 的方法当作默认行为，从而保证一致性。

### 2.3

---
author: Albert
date: 2024-02-22
date created: 2023-12-25
date updated: 2023-09-19 15:25

tags:
  - Blog
  - JS
  - front-end
title: JS-ES6-Symbol
---

# JS-ES6-Symbol

## 1. `Symbol` 是什么？

- 是 `ES2015` 版本之后的 **8 大基本数据类型** 当中的一种
- `Symbol` 类型的值是唯一且不可变的，通常作为对象的键来使用，这样可以确保对象的键能够 **全局唯一**，从而避免键的冲突。

> [!MDN]
> 每个从 Symbol() 返回的 symbol 值都是唯一的。一个 symbol 值能作为对象属性的标识符；这是该数据类型仅有的目的。

```js
const symbol1 = Symbol()
const symbol2 = Symbol(42)
const symbol3 = Symbol('foo')

console.log(typeof symbol1)
// Expected output: "symbol"

console.log(symbol2 === 42)
// Expected output: false

console.log(symbol3.toString())
// Expected output: "Symbol(foo)"

console.log(Symbol('foo') === Symbol('foo'))
// Expected output: false

console.log(symbol2.description)
// 42
```

- `const symbol3=Symbol('foo')`，这里的 `foo` 起到的作用仅仅只是“描述”，而起不到访问 `symbol3` 本身的功能

- 为什么将 `symbol` 设置成“基本数据类型”
  - 为了便于 `typeof` 运算符可以识别出 `symbol`

## 2. `Symbol` 的作用

### 2.1 唯一性

- 可以放置重复定义属性，利用唯一性实现对于对象属性的保护

```js
let id1 = Symbol('id')
let id2 = Symbol('id')

let user = {
  [id1]: 123,
  [id2]: 100
}

let id3 = Symbol('id')

user[id3] = 100

console.log(user)
```

### 2.2 私有性（属性保护）

```js
let secretKey = Symbol('secret')
let obj = {
  [secretKey]: 'Hello, world!'
}
```

- `secretKey` 是一个符号，它作为对象 `obj` 的属性键。这个属性只有通过 `secretKey` 才能被访问，无法通过常规的属性访问方式获取到。
- 这个属性在 `for...of` 遍历 和 `JSON.stringify` 当中都不会体现出来
- 只有拥有原始 `Symbol('secret')` 的代码才可以访问和修改这个属性。这个特性可以帮助你创建和维护私有属性，避免属性名冲突。

### 2.3 `well-known Symbols`

- `JS` 内置了一些预定义的 `symbol` 值，提供了修改内置对象行为的入口
- 比如 `Symbol.iterator` 用于定义对象的默认迭代器（对应了生成器方法）。如果我们能够获取这个入口，就可以修改默认迭代器的一些行为。

```js
if (1) {
  let arr = [1, 2, 3]

  arr[Symbol.iterator] = function* () {
    for (let i = 0; i < this.length; i++) {
      yield -this[i]
    }
  }

  let iterator = arr[Symbol.iterator]()

  console.log(iterator.next()) // {value: -1, done: false}
  console.log(iterator.next()) // {value: -2, done: false}
  console.log(iterator.next()) // {value: -3, done: false}
  console.log(iterator.next()) // {value: undefined, done: true}
}
```

## 3. `Symbol` 的一些特性

### 3.1 唯一性

> [!MDN]
> 每个从 Symbol() 返回的 symbol 值都是唯一的。一个 symbol 值能作为对象属性的标识符；这是该数据类型仅有的目的。

### 3.2 不支持 `new` 运算符（不充分的构造函数）

> [!MDN]
> 作为构造函数来说它并不完整，因为它不支持语法："new Symbol()"。

### 3.3 类型转化上的特点

> [!MDN]
>
> - 尝试将一个 `symbol` 值转换为一个 `number` 值时，会抛出一个 TypeError 错误 (e.g. `+sym` or `sym | 0`).
> - 使用宽松相等时，`Object(sym) == sym returns true`.
> - 这会阻止你从一个 `symbol` 值隐式地创建一个新的 `string` 类型的属性名。例如，`Symbol("foo") + "bar"` 将抛出一个 TypeError (can't convert symbol to string).
> - `String(sym) conversion` 的作用会像 `symbol` 类型调用 `Symbol.prototype.toString()` 一样，但是注意 `new String(sym)` 将抛出异常。

- 简单来说，就是两点：
  1. `Symbol` 向 `Number` 的 **一切显式、隐式的转化都是禁止的**
  2. `Symbol` 向 `String` 的转化在安全的情况下是允许的，这里的安全就是显式转化，比如，`String(someSymbol)` 或者 `const string = someSymbol.toString()` ，后者的转化方式应该是最佳的。

---

### 3.4 `JSON.stringify()` 会直接忽视以 `symbol` 类型作为键值的属性

> [!MDN]
> 当使用 JSON.stringify() 时，以 symbol 值作为键的属性会被完全忽略

```js
JSON.stringify({ [Symbol('foo')]: 'foo' })
// '{}'
```

---

### 3.5 在 `for...in` 迭代当中 **不可枚举**

> [!MDN] > `Symbols` 在 `for...in` 迭代中不可枚举。另外，`Object.getOwnPropertyNames()` 不会返回 `symbol` 对象的属性，但是你能使用 `Object.getOwnPropertySymbols()` 得到它们。

- 这种设计相对于利用 `Symbol` 实现对于某些属性的保护
- 但是注意，`Symbol` 作为 `key` 的属性的 `descriptor` 当中，`enumerable` 属性依然是 `true`，但是 `JS` 还是强行限制了忽略 `Symbol` 作为 `key` 的属性。

```js
if (1) {
  let secretKey = Symbol('secret')
  let obj = {
    [secretKey]: 'Hello, world!'
  }
  console.log(obj)
  const proDescriptors = Object.getOwnPropertyDescriptors(obj)
  console.log(proDescriptors)
}

/*
$ node SymbolUsage.js
{ [Symbol(secret)]: 'Hello, world!' }
{
  [Symbol(secret)]: {
    value: 'Hello, world!',
    writable: true,
    enumerable: true,
    configurable: true
  }
}
*/
```

### 3.6 `Symbol` 包装器对象作为属性的键

```js
var sym = Symbol('foo')
var obj = { [sym]: 1 }
obj[sym] // 1
obj[Object(sym)]
```

### 3.7 对 `Symbol` 添加描述

```js
const uniqueMethodSymbol = Symbol('uniqueMethod')
let obj = {
  [uniqueMethodSymbol]: function () {
    console.log('This is a unique method!')
  }
}

// 调用这个独特的方法
obj[uniqueMethodSymbol]() // 输出: This is a unique method!
```

## 4. 总结

在 JavaScript 中，Symbol 是一种特殊的、不可变的数据类型，可以作为对象的属性。Symbol 对象的主要特点和用途包括：

1. **唯一性**：每个 Symbol 值都是唯一的，这意味着你可以创建一个新的 Symbol，即使你给它相同的描述，它也不会等于任何其他的 Symbol。这可以用来创建一个对象的私有（或者保护）成员。

2. **不可枚举性**：Symbol 属性不会出现在 `for...in`、`for...of` 循环中，也不会被 `Object.keys()`、`Object.getOwnPropertyNames()`、`JSON.stringify()` 返回。但它可以被 `Object.getOwnPropertySymbols()` 和 `Reflect.ownKeys()` 返回。

3. **全局注册表**：Symbol 还有一个全局注册表，你可以通过 `Symbol.for(key)` 和 `Symbol.keyFor(sym)` 在全局范围内保存和检索 Symbol。

4. **内置 Symbol**：JavaScript 还有一些内置的 Symbol，比如 `Symbol.iterator`、`Symbol.asyncIterator`、`Symbol.toStringTag` 等，这些 Symbol 用来表示语言内部的行为。

因此，Symbol 主要用于创建对象的唯一属性名，防止属性名冲突，以及表示语言内部的行为。

> [!tip]
> 归根结底：`Symbol` 创建了一个独一无二的标识符，常常用于对象的属性名，以实现私有性和解决命名冲突的问题。其核心特点如下:
>
> 1.  独一无二
> 2.  私有性
> 3.  描述

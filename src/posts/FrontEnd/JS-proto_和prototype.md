---
author: Albert
category: CS-前端
date: 2024-02-22
date created: 2023-05-09
date updated: 2023-10-10 14:51
tags:
  - Blog
  - JS
  - front-end
title: JS-proto_和prototype
---

# JS-proto\_和prototype

> cite: <https://github.com/creeperyang/blog/issues/9>

## 1. `__proto__`

- 每个JS对象一定有一个原型对象，并且从中继承属性和方法
- 对象的`__proto__`属性的值就是它对应的原型对象

```javascript
var one = { x: 1 }
var two = new Object()
one.__proto__ === Object.prototype // true
two.__proto__ === Object.prototype // true
one.toString === one.__proto__.toString // true
```

## 2. `prototype`

- 只有函数才有`prototype`属性
- 当你创建函数时，JS会为这个函数自动添加`prototype`属性，值是一个有`constructor`属性的对象，不是空对象。
- 而一旦你把这个函数当作构造函数（`constructor`）调用（即通过`new`关键字调用），那么JS就会帮你创建该构造函数的实例，实例继承构造函数`prototype`的所有属性和方法（实例通过设置自己的`__proto__`指向承构造函数的`prototype`来实现这种继承）
- `newInstance.__proto__ === constructor.prototype`

---
author: Albert
date: 2024-02-22
date created: 2023-06-21 22:01
description: JS基础知识
tags:
  - Blog
  - JS
  - Frontend
title: JS-图解原型链
---

# JS-图解原型链

## 示例代码

```js
// constructor
function Box(value) {
  this.value = value
}

Box.prototype.getValue = function () {
  return this.value
}

const myBox = new Box(42)
```

- 构造函数的 `prototype` 等于 实例化对象的 `__proto__`
- 也就是说 `myBox.__proto__` 等于 `Box.prototype`
- 其原型链如下所示
  ![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230621220441.png)

- **所谓 A.prototype，就是“由构造函数 A 创建的所有对象实例共享的原型"，这个原型存储在 A.prototype中。** 关键!

## 原型链关系图

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230621221124.png)

- 绿框表示 **普通对象**， 红框表示 **函数对象**
- `somePerson.__proto__ === createPerson.prototype` 实例化对象的 `__proto__` 等于 构造函数的 `prototype`
- `createPerson.prototype` 和 `Function.prototype` 指向 `Object.prototype`

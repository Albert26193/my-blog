---
author: Albert
date: 2024-02-22
date created: 2023-09-19
date updated: 2023-09-19 14:54
tags:
  - Blog
  - JS
  - Interview
title: JS-如何判断对象为空
---

# JS-如何判断对象为空

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

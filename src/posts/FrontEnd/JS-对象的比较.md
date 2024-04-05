---
author: Albert
date: 2024-02-22
date created: 2023-05-09
date updated: 2023-03-23 15:56
description: JS基础知识
tags:
  - Blog
  - JS
  - Frontend
  - Interview
title: JS-对象的比较
---

# JS-对象的比较

## 1. 等号比较的是对象的内存地址

- 在 JavaScript当中，== 比较的是两个对象的内存地址

## 2. 利用`JSON.sringtify`转化比较

- 如果要比较两个对象的属性值是否相等，可以使用 JSON.stringify 方法将它们转换为 JSON 字符串，然后进行比较。例如，可以使用以下代码将 arrayToTree(arr, 0) 和 res 转换为 JSON 字符串，然后比较它们是否相等：
- `console.log(JSON.stringify(arrayToTree(arr, 0)) === JSON.stringify(res));`
  这样就可以比较两个对象的属性值是否相等了。需要注意的是，这种比较方式只适用于对象的属性值是基本数据类型（例如数字、字符串、布尔值等）或者是嵌套的对象或数组，_如果属性值是函数、Symbol 或其他非基本数据类型，则不能使用这种方式进行比较。_

## 3. 深度比较函数

- 如果对象的值是引用类型，那么就需要对此进行深度比较
- demo如下

```typescript
function deepEqual(obj1: any, obj2: any): boolean {
  // 如果两个对象引用地址相同，则它们一定相等
  if (obj1 === obj2) {
    return true
  }

  // 如果两个对象类型不同，则它们一定不相等
  if (typeof obj1 !== typeof obj2) {
    return false
  }

  // 如果两个对象是基本数据类型，则直接比较它们的值
  if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
    return obj1 === obj2
  }

  // 如果两个对象都是数组，则比较它们的长度和每个元素是否相等
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false
    }
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) {
        return false
      }
    }
    return true
  }

  // 如果两个对象都是对象，则比较它们的属性值是否相等
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  if (keys1.length !== keys2.length) {
    return false
  }
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false
    }
  }
  return true
}
```

- [ ] 手写深度比较函数

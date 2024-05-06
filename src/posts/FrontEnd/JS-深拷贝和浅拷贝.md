---
author: Albert
date: 2024-02-22
date created: 2023-05-09
tags:
  - Blog
  - JS
  - Interview
  - Frontend
title: JS-深拷贝和浅拷贝
---

# JS-深拷贝和浅拷贝

## 什么是深拷贝、浅拷贝？

> [!note]
>
> - 浅拷贝是指将一个对象的引用复制给另一个对象，**两个对象共享同一块内存空间**（`JS` 里面并不完全是这样的）。如果其中任何一个对象修改了这个内存空间的值，那么另一个对象也会受到影响。**_对象的浅拷贝是其属性与拷贝源对象的属性共享相同引用（指向相同的底层值）的副本。_**
> - 深拷贝是指将一个对象的内容复制到另一个对象中，**两个对象不共享同一块内存空间**。如果其中任何一个对象修改了这个内存空间的值，另一个对象不会受到影响。

- 浅拷贝 (shallow copy) 拷贝对象的引用
- 深拷贝 (deep copy) 拷贝对象本身，_相当于复制一个全新的独立对象_

## 二者的实现方式是什么？

### 浅拷贝

1. `Object.assign()` - Array 可以吗

```js
const originalObj = { a: 1, b: { c: 2 } }
const shallowCopy = Object.assign({}, originalObj)

// a 是基础类型，不会影响之前的数值
// b 是引用类型，会影响之前的数值
shallowCopy.a = 100
shallowCopy.b.c = 200
printObject(originalObj)
```

- 输出结果如下：
  ![image.png|350](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230601210022.png)

2. `Array.from()`

```js
const originalArray = [1, 2, [3, 4]]
const shallowCopy = Array.from(originalArray)
```

3. `slice or concat`

```js
const originalArray = [1, 2, [3, 4]]
const shallowCopy1 = originalArray.slice()
const shallowCopy2 = [].concat(originalArray)
```

4. `Object.keys()`

```js
const originalObj = { a: 1, b: { c: 2 } }

const shallowCopy = Object.keys(originalObj).reduce((acc, key) => {
  acc[key] = originalObj[key]
  return acc
}, {})
```

5. 解构赋值
   [[../../答疑/JS的“对象模板"问题|JS的“对象模板"问题]]

```js
const calendarTemplate = {
  year: 2023, // (optional) defaults to current year
  colors: {
    //xxxx some code
  },
  entries: [
    {
      name: 'wahaha',
      descript: {
        age: 20,
        detail: {
          case: 'test'
        }
      }
    }
  ]
}

// ... some more code
const { entries, ...rest } = calendarTemplate

const calendarDataAllNotes = { entries: [...entries], ...rest }
const calendarDataAlgorithm = { entries: [...entries], ...rest }
const calendarDataLinux = { entries: [...entries], ...rest }
```

6. `MDN` 推荐的方式（**最佳**）

```js
Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))
```

---

### 深拷贝

> [!tip]
> 深拷贝就是全面拷贝，下面提供两种思路
>
> 1. 利用 `JSON.stringtify() + JSON.parse()` 将对象转化成 `JSON` 数组实现
> 2. 利用递归浅拷贝实现

1. ==method 1==： 利用 `JSON`

```js
function deepCloneWithJson(targetObject) {
  toJsonObject = JSON.stringify(targetObject)
  deepCloneObject = JSON.parse(toJsonObject)
  return deepCloneObject
}
```

2. ==method2==: 利用 `递归浅拷贝`

```js
function deepClone2(targetObject) {
  if (targetObject === null || typeof targetObject !== 'object') {
    return targetObject
  }

  const cloneObj = Array.isArray(targetObject) ? [] : {}

  for (let key in targetObject) {
    cloneObj[key] = targetObject[key]
  }

  return cloneObj
}
```

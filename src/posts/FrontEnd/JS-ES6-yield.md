---
author: Albert
date: 2024-02-22
date created: 2023-12-25
date updated: 2023-07-23 18:39
description: info
tags:
  - JS
  - front-end
title: JS-ES6-yield
---

# JS-ES6-yield

## 1. `yield` 执行过程

### 1.1 示例 1

- 观察下面代码

```js
if (1) {
  function* generator() {
    const value1 = yield 1;
    console.log('generator received:', value1);
    const value2 = yield 2;
    console.log('generator received:', value2);
    yield 3;
  }

  const gen = generator();
  console.log('outside', gen.next()); // { value: 1, done: false }
  console.log('outside', gen.next('foo')); // generator received: foo, { value: 2, done: false }
  console.log('outside', gen.next('bar')); // generator received: bar, { value: 3, done: false }
  console.log('outside', gen.next()); // { value: undefined, done: true }
}
```

- 问题 1： `foo` 传递到了哪里？

> [!question]
> - 在首次执行 gen.next() 的时候，函数会在 yield 1 处暂停，在调用 gen.next('foo') 的时候，函数应该已经从 console.log('generator received:', value1); 这一行开始执行了，那么，此时的 value1 应该是 undefined 才对，'foo' 参数究竟传入到了哪里

- 实际上，理解这个问题需要明确整个执行过程
  1. 首先，调用 `gen.next()` 的时候，`yield` 表达式暂停了 `generator` 函数的执行过程，同时，`generator` 生成出来的的 `Iterator` 迭代器，也就是 `gen` 变量，在调用 `next()` 的时候，其结果就是 `{value: 1, done: false}` 。那么，此时的 `value1` 还是 `undefined`
  2. 然后，调用 `gen.next('foo')` 的时候， `const value1 = yield 1` 表达式，**会从上一次暂停的状态恢复执行**，此时，`value1` 会看 `next()` 方法是否具备入参。这里，自然是具备的，入参就是 `'foo'`，那么，之前被暂停的 `yield` 的返回值，就是 `'foo'`。执行到 `const value2 = yield 2` 的时候又会停住，`gen.next('bar')` 的调用结果就是 `{value: 2, done:false}`
  3. `gen.next(bar)` 调用的过程基本上同理，最后在 `yield 3` 这里暂停
  4. 最后一次 `gen.next()` 已经没有 `yield` 可供消耗了，因此其 `value` 为 `undefined`
---
- 问题 2： 首次调用 `gen.next()` 的时候如果提供入参，比如，`gen.next('hello')` 存在意义吗？
- 不存在，因为入参的含义是 **恢复上次执行时的 `yield` 表达式，并指定其返回值**。既然是首次调用 `next`，那么一定不存在 **上次执行** 时的 `yield` 表达式。

### 1.2 示例 2

```js
if (0) {
  function* generatorFunction() {
    let x = 1;
    let y = yield x;      // e1
    console.log('y', y)   // e2
    y = yield y + 2;      // e3
    return y;
  }

  let generator = generatorFunction();

  console.log(generator.next()); // { value: 1, done: false }
  console.log(generator.next(10)); // { value: 12, done: false }
  console.log(generator.next(20)); // { value: 20, done: true }

  /**
   * 1. generator.next() 调用 e1, x 成为 iterator.next() 返回对象的value
   ***** let y = yield x, y 此时还是undefined,因为 Iterator.next() 没有指定入参
   * 2. generator.next(10) 还是从e1所在的地方恢复执行, 此时 y 成为 10
   ***** 触发了 console.log('y', y), 输出 'y' 10
   ***** 执行 y = yield y + 2, 返回 generator.next(10), 也就是 {value: 12, done: false}
   * 3. generator.next(20) 从e2处恢复执行, 此时,y变成了20, 后面执行的过程同上
  */
}

```

## 2. 关于 `MDN` 当中的描述

### 2.1 `MDN` 原文

![image.png|500](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20230723181711.png)

### 2.2 关于 `MDN` 示例代码

```js
function* counter(value) {
  let step;

  while (true) {
    step = yield value++;
    if (step) {
      value += step;
    }
  }
}

const generatorFunc = counter(0);
console.log(generatorFunc.next().value); // 0
console.log(generatorFunc.next().value); // 1
console.log(generatorFunc.next().value); // 2
console.log(generatorFunc.next().value); // 3
console.log(generatorFunc.next(10).value); // 14
console.log(generatorFunc.next().value); // 15
console.log(generatorFunc.next(10).value); // 26
```

- 显然，上面的代码当中，`if(step)` 并不是每次都被触发，只有 `next(10)` 这种提供入参的调用，`step` 作为 **上一次 yield 表达式的返回值** 才能被赋值为 `10`
---

```js
function* fibonacci() {
  var fn1 = 0;
  var fn2 = 1;
  while (true) {
    var current = fn1;
    fn1 = fn2;
    fn2 = current + fn1;
    var reset = yield current;
    if (reset) {
      fn1 = 0;
      fn2 = 1;
    }
  }
}

var sequence = fibonacci();
console.log(sequence.next().value); // 0
console.log(sequence.next().value); // 1
console.log(sequence.next().value); // 1
console.log(sequence.next().value); // 2
console.log(sequence.next().value); // 3
console.log(sequence.next().value); // 5
console.log(sequence.next().value); // 8
console.log(sequence.next(true).value); // 0
console.log(sequence.next().value); // 1
console.log(sequence.next().value); // 1
console.log(sequence.next().value); // 2
```

- 此处亦然，`reset` 只有在 `next` 具备入参的条件下才拥有具体数值，进而通过 `next(true)` 触发重设
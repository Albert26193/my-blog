---
author: Albert
date: 2024-02-22
date created: 2023-05-09
tags:
  - Blog
  - JS
  - Frontend
title: JS-闭包
---

# JS-闭包

## 1. 闭包的定义

> MDN定义如下：
> 闭包（closure）是一个函数以及其捆绑的周边环境状态（lexical environment，词法环境）的引用的组合。 换而言之，闭包让开发者可以从内部函数访问外部函数的作用域。 在 JavaScript 中，闭包会随着函数的创建而被同时创建。

- 还是举一个MDN当中的例子，以下函数：

```javascript
function makeAdder(x) {
  return function (y) {
    return x + y
  }
}

let add5 = makeAdder(5)
console.log(add5(72))

let add100 = makeAdder(100)
console.log(add100(88))
```

- `add5`和`add100`都是闭包，闭包是对函数及其上下文环境的组合**的引用**。闭包能够让开发者从内部环境访问外部环境的作用域。

## 2. 如何理解定义中的“引用”二字

- 还是MDN当中的例子

```js
function makeFunc() {
  let name = 'Mozilla'
  function displayName() {
    console.log('inner:', name)
  }
  return displayName
}

let myFunc = makeFunc()
myFunc()
```

> MDN:
> 在本例子中，myFunc 是执行 makeFunc 时创建的 _displayName_ 函数实例的引用。displayName 的实例维持了一个对它的词法环境（变量 name 存在于其中）的引用。 因此，当 myFunc 被调用时，变量 name 仍然可用，其值 Mozilla 就被传递到alert中。

- `myFunc`是对*display*函数和其上下文环境结合的引用，那么`myFunc`就是一个闭包。

## 3. 闭包和立即执行函数

- 原来的例子如下，是MDN当中的例子

```js
let makeCounter = function () {
  var privateCounter = 0
  function changeBy(val) {
    privateCounter += val
  }
  return {
    increment: function () {
      changeBy(1)
    },
    decrement: function () {
      changeBy(-1)
    },
    value: function () {
      return privateCounter
    }
  }
}

let Counter1 = makeCounter()
let Counter2 = makeCounter()
console.log(Counter1.value()) /* logs 0 */
Counter1.increment()
Counter1.increment()
console.log(Counter1.value()) /* logs 2 */
Counter1.decrement()
console.log(Counter1.value()) /* logs 1 */
console.log(Counter2.value()) /* logs 0 */
```

> MDN:
> 在之前的示例中，每个闭包都有它自己的词法环境； 而这次我们只创建了一个词法环境，为三个函数所共享： Counter.increment，Counter.decrement 和 Counter.value。  
>  该共享环境创建于一个立即执行的匿名函数体内。这个环境中包含两个私有项： 名为 privateCounter 的变量和名为 changeBy 的函数。 这两项都无法在这个匿名函数外部直接访问。 必须通过匿名函数返回的三个公共函数访问。 这三个公共函数是共享同一个环境的闭包。
> 多亏 JavaScript 的词法作用域， 它们都可以访问 privateCounter 变量和 changeBy 函数。

- 如果对MDN当中的这个例子稍稍修改，将`makeCounter`用`()`包裹起来，使之成为一个立即执行函数，那么:
- [[../Function/JS-立即调用函数表达式(IIFE)]]

```js
let makeCounter = (function () {
  var privateCounter = 0
  function changeBy(val) {
    privateCounter += val
  }
  return {
    increment: function () {
      changeBy(1)
    },
    decrement: function () {
      changeBy(-1)
    },
    value: function () {
      return privateCounter
    }
  }
})()

let Counter1 = makeCounter()
let Counter2 = makeCounter()
console.log(Counter1.value()) /* logs 0 */
Counter1.increment()
Counter1.increment()
console.log(Counter1.value()) /* logs 2 */
Counter1.decrement()
console.log(Counter1.value()) /* logs 1 */
console.log(Counter2.value()) /* logs 1 */
```

- `Counter1`存储`makeCounter`返回之后的结果，但是其上下文环境一直被保存，因此，最后一行的`Counter2.value()`返回的结果始终和`Counter1.value()`的结果是一致的，都是其内部的`privateConter`的数值。
- `privateCounter`的数值可以被认为是全文唯一的。

## 4. 利用闭包实现代理模式

- 以下是曾探书的原文
- 实现了代理模式（缓存代理）

```js
/**************** 计算乘积 *****************/
var mult = function(){
    var a = 1;
    for ( var i = 0, l = arguments.length; i < l; i++ ){
      a = a * arguments[i];
    }
    return a;
};

/**************** 计算加和 *****************/
var plus = function(){
    var a = 0;
    for ( var i = 0, l = arguments.length; i < l; i++ ){
      a = a + arguments[i];
    }
    return a;
};

/**************** 创建缓存代理的工厂 *****************/
var createProxyFactory = function( fn ){
    var cache = {};
    return function(){
      var args = Array.prototype.join.call( arguments, ', ' );
      if ( args in cache ){
          return cache[ args ];
      }
      return  cache[ args ] = fn.apply( this, arguments );
    }
};

var proxyMult = createProxyFactory( mult ),
var proxyPlus = createProxyFactory( plus );

alert ( proxyMult( 1, 2, 3, 4 ) );    // 输出：24
alert ( proxyMult( 1, 2, 3, 4 ) );    // 输出：24
alert ( proxyPlus( 1, 2, 3, 4 ) );    // 输出：10
alert ( proxyPlus( 1, 2, 3, 4 ) );    // 输出：10
```

- `proxyMult`和`proxyPlus`两次调用`createProxyFactory`函数，它们两个都相当于`createProxyFactory`的返回值。
- 闭包的上下文是定义的时候被决定的，因此，`proxyMult`和`proxyPlus`用的是一套上下文环境。`cache`是同一个`cache`。

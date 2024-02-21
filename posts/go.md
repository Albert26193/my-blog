---
author: Albert
date: 2024-02-21
date created: 2024-01-01
date updated: 2024-01-11 14:27
tags:
  - go
  - 面经
title: Go-make和new和字面量的区别
---

#go #面经

# Go-make和new和字面量的区别

> [理解 Go make 和 new 的区别 | 三月沙](https://sanyuesha.com/2017/07/26/go-make-and-new/)

## 1. 总结

- new(T) 返回 T 的指针 \*T 并指向 T 的零值。
- make(T) 返回的初始化的 T，只能用于 slice，map，channel。

---

在Go语言（golang）中，make和new有以下区别：1.初始化的区别；2.分配内存的区别；3.返回类型的区别；4.语法上的区别；5.实用性的区别。

## 2. 初始化的方式

- `new` 实际使用的频率非常低，仅仅通过字面量就可以完成了
- `new` 和 `make` 都可以用以分配内存，而且都是在堆上分配内存，但是不同的是，`new` _分配空间后，将内存清零，没有初始化内存，_ 而 `make` 分配空间后，是初始化内存，不是清零。

```go
type Foo struct {
    name string
    age  int
}

//声明初始化
var foo1 Foo
fmt.Printf("foo1 --> %#v\n ", foo1) //main.Foo{age:0, name:""}
foo1.age = 1
fmt.Println(foo1.age)

//struct literal 初始化
foo2 := Foo{}
fmt.Printf("foo2 --> %#v\n ", foo2) //main.Foo{age:0, name:""}
foo2.age = 2
fmt.Println(foo2.age)

//指针初始化
foo3 := &Foo{}
fmt.Printf("foo3 --> %#v\n ", foo3) //&main.Foo{age:0, name:""}
foo3.age = 3
fmt.Println(foo3.age)

//new 初始化
foo4 := new(Foo)
fmt.Printf("foo4 --> %#v\n ", foo4) //&main.Foo{age:0, name:""}
foo4.age = 4
fmt.Println(foo4.age)

//声明指针并用 new 初始化
var foo5 *Foo = new(Foo)
fmt.Printf("foo5 --> %#v\n ", foo5) //&main.Foo{age:0, name:""}
foo5.age = 5
fmt.Println(foo5.age)
```

## 3. 适用对象不同

- `new` 可以给多种类型分配内存
- `make` 专门用于给 `slice/map/chan` 三种类型分配内存

## 4. 返回类型的区别

- `new` 返回的是指向类型的*指针*
- `make` 返回的类型和参数类型相同，因为参数本身就是引用类型。

---
author: Albert
date: 2024-02-22
date created: 2023-12-07
date updated: 2023-12-07 20:37
tags:
  - Go
  - back-end
  - interview
title: Go-关于Slice
---

#Go #back-end #interview

# Go-关于Slice

> [!info]
> 切片本身是一个只读对象，其工作机制类似数组指针的一种封装。

## 1. Go 内置类型

- `go` 分为基本数据类型和内置数据类型
- 基本数据类型包括：
  1. `boot`
  2. `byte`
  3. `number`
  4. `string`
  5. `rune`
- 内置数据类型分为:,

1. 数组
2. 切片
3. `map`
4. `channel`
5. `error`

## 2. `slice`的底层实现

- `Slice` 的本质是一个**引用类型**，它是对**底层数组的可变长度的引用**。
  1. `pointer`：指向当前切片的头部
  2. `length`：表示切片当中元素的数量
  3. `capacity`： 表示底层数组当中可以访问的元素数量

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20231019204009.png)

- 这样实现的好处是什么？为什么这么设计？
- 实际上，这个设计和 `Redis` 的 `SDS(Simple Dynamic String)` 比较相似
- **最根本的原因，是希望降低*数组插入/删除/合并/截断*操作的复杂度，** 还能节省内存的分配和复制。

---

- 以*插入元素*为例，说明 `slice` 的工作机制
- 分成两种情况，首先，会判断 `slice` 的 `cap` 容量是否充足？
  - 如果充足：那么，直接计算出插入的位置，执行插入之后，更新容量和长度
  - 如果不足：那么，会对底层数组进行扩容（一般扩容为两倍），然后将原有数组中的元素一一拷贝至扩容后数组中（复杂度 `O(n)`)。
- 总结一下，**`slice` 能够利用预分配的空间，避免了内存的频繁容量扩展**

---

- 如果是*合并* 操作呢？也是如此，通过预分配的策略避免了内存的频繁扩展

## 3. 子 `slice` 的原理

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20231019212219.png)

- 在底层数组上可以创建新的 `slice` 结构，如 `sonSlice := fatherSlice[1:3]` ，构造了所谓的的子 `slice`。
- 如果**两个切片共享同一个底层数组，那么，如果一个切片修改了底层数组，另外一个切片也能感知到**。
- 子 `slice` 的容量也可以通过偏移量计算出：_子切片的容量位底层数组的长度减去切片在底层数组的偏移量_。
- 当然，可以通过显式指定子切片容量的方式来规定其大小，_但是不能超过底层数组限制的容量上限_

```go
func main() {
    source := []string{"Apple", "Orange", "Plum", "Banana", "Grape"}
    // 指定其容量为 4
    // 但是容量不能超过底层数组原有容量
    slice := source[2:3:4]
    fmt.Println(cap(slice))
}
```

## 4. 切片的值传递

- 在函数当中以切片为形参的时候，本质上传递的是*值*，这一点和 `JS` 非常类似。
- `slice` 作为形参的时候，很容易被误解为引用传递，比如下面的代码

```go
package main

import "fmt"

func changeSlice(s []int) {
        s[1] = 888
        fmt.Printf("in func, addr: %p\n", &s)
}

func main() {
        slice := []int{0, 1, 2, 3}
        fmt.Printf("slice: %v %p\n", slice, &slice)

        changeSlice(slice)
        fmt.Printf("sclie: %v %p\n", slice, &slice)
}
```

- 其输出表现为：

![image.png|400](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20231019221305.png)

- 可以看到，函数内部和外部的地址是不一样的，因此，**一定不是引用传递**。
- 那么，为什么函数内部的修改会影响外部的表现呢？因为，**`go` 传入的是一个数值，该数值本身的类型是 `slice`， 其内部保留了一个指向底层数组的指针，这个指针的值也被拷贝了一份，然后传入到函数当中了。**
- 无论函数内外，访问的底层数组没有变化，其修改自然可以被函数外部的指针访问到。
- 总而言之，传递的是“值”，**_只不过这个值，是引用类型的值_**。

---

- 此外，如果在形参传递过程当中，发生了数组扩容，**那么，形参和实参的底层数组就不是同一个数组了**，其结果，自然是*内部修改影响不了外部变量*。
- 比如下面的代码

```go
func main() {
    slice := make([]int, 2, 3)
    for i := 0; i < len(slice); i++ {
        slice[i] = i
    }

    fmt.Printf("slice: %v, addr: %p \n", slice, slice)

    changeSlice(slice)
    fmt.Printf("slice: %v, addr: %p \n", slice, slice)
}

func changeSlice(s []int){
    s = append(s, 3)
    s = append(s, 4)
    s[1] = 111
    fmt.Printf("func s: %v, addr: %p \n", s, s)
}
```

- 其输出如下，在 `changeSlice` 函数内部，底层数组扩容，形参实参指向的底层数组不一致，因此，修改无法被函数外部感知。

![image.png](https://img-20221128.oss-cn-shanghai.aliyuncs.com/img-2023-05/20231019222019.png)

## 5. 总结：为什么需要设计出 `Slice`

### 5.1 对于操作系统而言

1. 为了更好的*值传递*，`go` 语言当中的数组无法像 `C/Cpp` 那样作为*隐式指针* 参与参数的传递，在函数传参阶段，如果使用传统的数组，**不可避免需要复制不必要的空间**。
2. 为了更好的*内存分配*，`go` 的 `slice` 扩容采取了类似于倍增的方式，避免了**频繁的内容扩容操作**，能够减少内容分配的次数。
3. 为了更好的*安全性*，`go` 会对 `slice` 的大小进行检查，避免了底层数组的越界现象。

### 5.2 对于程序员而言

- 提供了一套更加简洁方便的操作接口，能够轻松产生*子切片*，更加容易地进行*拼接/截断/插入*等操作。``

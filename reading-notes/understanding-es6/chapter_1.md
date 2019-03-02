# 第一章 块级作用域绑定

[TOC]

## 变量提升机制 - Hoisting

要理解变量提升首先要明确两个前提：

* 第一个是在 ES5 的世界中，通常使用关键字 `var` 来声明变量；
* 第二个是 javaScript 语言 ES5 的标准下作用域仅仅分为**全局作用域**和**函数作用域（也成为局部作用域）**。

那么变量提升则是在全局或局部作用域内，不论在什么位置通过 var 关键字声明的变量在**解释（编译）阶段**，会提升至当前作用域的顶部。以下面的代码为例：

```javascript
// before hoisting
var x;
var y = 2;

function foo () {
    var z = 3;

    if (condition) {
        // 因为在 ES5 标准中仅有全局和函数作用域
        // 即使在 if 语句块中 var value 仍然被提升至函数 foo 内部作用域的顶部
        var value = 'blue';
    } else {
        console.log(value);
    }

    console.log(value);
    console.log('x+y+z', x + y + z);
}

x = 3;
foo(); // 3 + 2 + 3 = 8
```

经过变量提升：

```javascript
// after hoisting
var x;
var y;
function foo () {
    var z;
    var value;
    z = 3;

    if (condition) {
        value = 'blue';
    } else {
        console.log(value); // undefined
    }

    console.log(value); // undefined if condition === false
    console.log('x+y+z', x + y + z);
}
y = 2;
x = 3;
foo(); // 8
```

通过以上栗子可以看出，在全局或函数作用域内，变量声明和函数声明均会被提升至当前作用域的顶部，这样解释了为什么先赋值后声明的代码在**运行时**不会报错。需要注意的是，声明函数有两种方式：

* 一种是使用 `function [FunctionName] () {}` 这种方式声明的叫做**函数声明式**；
* 另一种则是使用 `var` 关键字，以 `var [FuncitonName] = function () {}` 的方式创建的叫做**函数表达式**。

*以函数表达式创建的函数并不会被提升至顶部*：

```JavaScript
// hoisting for function
// foo 函数会被提升至当前作用域的顶部
function foo () {
    // ...
}

// -----------------

// bar 函数不会被提升至当前作用域的顶部
var bar = function () {
    // ...
}

// after hoisting ===>

var bar;
bar = function () {
    // ...
}
```

## 块级声明


刚刚接触 JavaScript 的同学对变量提升机制需要适应和习惯，在做项目或者是练习的时候偶尔会出现 bug。为此，ES6 引入了块级作用域来强化变量**生命周期**的控制。

块级作用域用于声明在指定的作用域之外无法被访问的变量。在 ES5 标准时代作用域仅分为全局和局部的，这样导致了在 if 语句块中声名的变量由于被提升至顶部使其可以在作用域内随便被访问（当然，访问的位置要在其声明语句的下方）。这种情况在 ES6 标准中不会发生，因为 if 语句声明的块就是块级作用域。

块级作用域（也叫做词法作用域）存在于：

* 函数内部；
* 块中（字符 `{` 和 `}` 之间的区域，比如 `if / for` 等语句声明的块）。

ES6 标准的目的并非是取替 ES5 标准，它更是一种对于 ES5 各个方面的不足的补全和优化。因此，若想要使用块级作用域，使用 `let` 和 `const` 关键字声明变量（使用 `var` 关键字声明的变量仍然遵从 ES5 标准，块级作用域不会生效）。

在学习 `let` 与 `const` 关键字声明的时候，突如其来的一个新概念 —— “临时死区（Temporal Distortion Zone，TDZ）”让我觉得很好奇。

首先，这个名词的来源是 JavaScript 的社区，因为 ES6 标准中没有明确提到 TDZ，但是通常借助它来解释 `let` 和 `const` 不提升的原因。话不多说上代码：

```javascript
// TDZ
// 考虑下面这种情况会输出什么？
console.log(foo);
console.log(bar);

let foo = 1;
const bar = 'bar';

// ====>
// Uncaught ReferenceError: foo is not defined
// Uncaught ReferenceError: bar is not defined
```
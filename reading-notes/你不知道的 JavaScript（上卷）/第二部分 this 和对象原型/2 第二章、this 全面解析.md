## this 全面解析

调用位置：调用位置就是函数在代码中被调用的位置（不是声明的位置）；

```javascript
function baz() {
  // 当前调用栈：baz
  // 当前调用的位置是全局作用域
  console.log("baz");
  bar();
}

function bar() {
  // 当前调用栈：baz -> bar
  // 当前调用的位置是 baz
  console.log("bar");
  foo();
}

function foo() {
  // 当前调用栈：baz -> bar -> foo
  // 当前调用的位置是 bar
  console.log("foo");
}

baz(); // -> baz 的调用位置
```

### 绑定规则

这一节是比较重要的一节，因为文中罗列了 4 中关于 this 绑定的情况，而这 4 中情况在日常的代码编写过程中还是很常见的；

#### 1. 默认绑定

这是最常用的函数调用类型：独立函数调用；

在代码中，函数直接使用**不带任何修饰**的函数引用进行调用的，那么默认绑定一般在严格模式下会将 this 绑定到（指定） `undefined`，而在非严格模式下会被绑定到全局对象；

#### 2. 隐式绑定

需要考虑的是调用位置是否有上下文对象，或者说是否被某个对象拥有或者包含；

当函数引用有上下文对象时，隐式绑定规则会把函数调用中的 this 绑定到这个上下文对象；

需要注意如下代码：

```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 2,
  foo: foo,
};

var bar = obj.foo;
var a = "oops, global";
bar(); // -> oops, global
```

`bar` 执行了 `obj.foo` 函数，引用的是 `foo` 函数本身，因此在执行 `bar` 函数的时候，不带任何修饰的函数调用，因此发生了默认绑定，这种情况就是**绑定丢失**；

#### 3. 显式绑定

使用 call 和 apply 方法强制地将 this 绑定到某个上下文中，就是显式绑定；

但是上述两种方法依然无法解决绑定丢失的问题；

##### 3.1 硬绑定

ES5 中提供内置的方法：`Function.prototype.bind`；

#### 4. new 绑定

构造函数在 JavaScript 中只是一些使用 new 操作符时被调用的函数，只是被 new 操作符调用的普通函数而已；

基于 new 操作符调用函数会自动执行以下的操作：

1. 创建一个全新的对象；
2. 这个新对象会继承函数的原型链；
3. 重新绑定 this 到新对象；
4. 如果函数没有其他返回值，则返回这个新对象，否则：
   1. 如果函数返回的是基础类型，则仍然返回这个新对象；
   2. 如果函数返回的是内置对象类型，则返回这个内置对象；

#### 优先级

new 绑定 ≈ 显示绑定 > 隐式绑定 > 默认绑定

#### 判断 this

1. 判断函数是否在 new 中调用；
2. 判断函数是否通过 `call` 或者 `apply` 显式绑定或者硬绑定；
3. 函数是否在某个上下文中调用（隐式绑定）；
4. 如果以上都不是的话，则使用默认绑定；

#### 例外的情况

1. 使用 null 或 undefined 作为 this 的绑定传入 call/apply/bind 方法，这些值在调用时会被忽略，执行默认绑定；
2. 间接引用，比如 `(p.foo = o.foo)()` 返回值是目标函数的引用，会执行默认绑定；

#### 软绑定

如果可以给默认绑定指定一个全局对象或者是 undefined 以外的值，那就可以实现和硬绑定相同的效果，同时保留了隐式绑定或者显式绑定修改 this 的能力；

```javascript
if (!Function.prototype.softBind) {
  Function.prototype.sofeBind = function (obj) {
    var fn = this;
    var curried = [].slice.call(argments, 0);
    var bound = function () {
      return fn.apply(
        !this || this === (window || global) ? obj : this,
        curried.concat.apply(curried, arguments)
      );
    };
    bound.prototype = Object.create(fn.prototype);
    return bound;
  };
}
```

#### 更安全地使用 this

有些三方库可能会修改 this 指向的对象，如果对这个库进行硬绑定的话，有可能会导致修改全局对象；

借助 DMZ（非军事区）来给 this 分配一个彻底为空的对象，`ø = Object.create(null)`，以保护全局对象；

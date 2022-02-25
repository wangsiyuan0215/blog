查看原文请点击[这里](https://mp.weixin.qq.com/s/dsVDKSAG3yPKXqYA4Y6bEQ)。

这篇文章是通读《vue源码中值得学习的方法》一文后，结合自己的经验，提取出来的归纳和总结。

正文开始~~~

#### 1. 数据类型判断

我通常会用 `Object.prototype.toString()` 这个方法去判断对象是什么类型，通常会返回 `[object Object|Array|Function]` 类似这样的字符串，用以表示当前对象的类型；

需要特殊注意的是，当判断对象是 `null` 和 `undefined` 时，当前方法会返回：
```javascript
Object.prototype.toString.call(null);       // [object Null]
Object.prototype.toString.call(undefined);  // [object Undefined]
```

根据文中介绍的方法，可以通过截取字符串的方式来获取对象类型的唯一标识。


#### 2. 利用闭包构造map缓存数据

结合文中给出的代码，我做了些注释：
```javascript
function makeMap (str, expectsLowerCase) {
    // 构建闭包集合map
    /*
        Object.create 创建一个新对象，使用现有的对象来提供新创建的对象的 __proto__（原型对象）;
        这里使用 null 作为新对象的原型对象，目的是在于：
        
            map[val.toLowerCase()] 或 map[val]
        
        获取 map 对象的某个属性时不被 map 原型链上的同名属性影响。
    */
    var map = Object.create(null);
    var list = str.split(',');
    for (var i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase
      ? function (val) { return map[val.toLowerCase()]; }
      : function (val) { return map[val]; }
}
```
上述方法中的思想值得借鉴，可以用于枚举类型或表驱动中。


#### 3. 二维数组扁平化

二维数组扁平化是个老生常谈的问题，有很多解决方法，文中的方法是使用 `Array.prototype.concat`，如果要是 ES6 标准的话，亦可以使用「解构」。


#### 4. 方法拦截

Vue 中使用了 `Object.defineProperty` 方法进行依赖收集（拦截），但是对于数组的下标赋值却无法检测，即：`arr[2] = 'test'` 这种赋值是无法被监测到发生变化的。

但是在 Vue 中，如果我们对数组使用 `push`，`pop` 原生方法却可以检测到数组发生的变化，从而触发试图更新。

这是由于 Vue 基于 Array 的原型对象创建了新对象，在新对象上的原生方法进行重写。

**这么做的目的是，即保证了在框架内对这些原生方法的拦截，又保证了在 Vue 实例以外的数组不会被这些重写的原生方法影响（否则在实例外改变数组，也会触发视图更新）。**

代码如下：
```javascript
// 重写push等方法，然后再把原型指回原方法
var ARRAY_METHOD = [ 'push', 'pop', 'shift', 'unshift', 'reverse',  'sort', 'splice' ];
// 创建了一个新对象，其原型对象为 Array 的原型对象
var array_methods = Object.create(Array.prototype);
ARRAY_METHOD.forEach(method => {
    array_methods[method] = function () {
        // 拦截方法
        console.log('调用的是拦截的 ' + method + ' 方法，进行依赖收集');
        
        return Array.prototype[method].apply(this, arguments);
    }
});
```

#### 5. 继承的实现

又是一个老生常谈的问题，**寄生-组合式继承应该是最合理的继承方式。**


#### 6. 执行一次

`once` 是 Vue 中的一个 API，目的是仅允许参数函数执行一次，利用闭包直接实现就好。

```javascript
function once (fn) {
  var called = false;
  return function inner () {
    if (!called) {
      called = true;
      /*
        这里注意上下文的指向，上下文的指向是在函数执行时确定的，
        因此这里的 this 会在 once 返回的 inner 函数执行时被确定
      */
      fn.apply(this, arguments);
      
      /*
        如果写成如下方式，根据执行时指定上下文原则，fn 中的 this 应该指向 inner，
        这就会导致 this 指向的错误。
      */
      fn(arguments);
    }
  }
}

// 如果不考虑将返回的函数赋值给其他对象的属性的话（但又会怎么不考虑呢？），ES6 的箭头函数是一个不错的选择。
const once = (fn) => {
    let called = false;
    return (a, ...args) => called === true 
      ? false
      : (called = true, fn.apply(this, [a, ...args]));
}
```
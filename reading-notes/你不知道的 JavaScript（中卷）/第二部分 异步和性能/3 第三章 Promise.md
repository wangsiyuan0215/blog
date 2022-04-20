#### Promise 的特点

Promise 一旦决议，它就永远保持在这个状态。此时它就成为了不变值。

Promise 决议后就是外部不可变的值，我们可以安全地把这个值传递给第三方，并确信它不会被有意无意地修改。

对一个 Promise 调用 then(...) 的时候，即使这个 Promise 已经决议，提供给 then(...) 的回调也总会被异步调用。

#### Promise 类型判断

鸭子类型：根据一个值的形态（具有哪些属性）来对这个值的类型做出一些假定。这种类型检查一般称之为“鸭子类型”。

```javascript
if (p !== null
    && (typeof p === 'object' || typeof p === 'function')
    && typeof p.then === 'function') {
  		// 假定这是一个 thenable
		} else {
      // 不是一个 thenable
    }
```

如此，若其他对象或者函数具备 then 函数，那么都可以被认为是一个 thenable 类型。

标准决定劫持之前未保留的属性名 then。这意味着不管是过去、现存还是将来，都不能拥有 then 属性函数，不论是有意的还是无意的。

#### then 的执行顺序

一个 Promise 决议以后，这个 Promise 上**所有**通过 then(...) 注册的回调都会在下一个异步时机点（下一个 CPU 时钟，event loop）上依次被立即执行。

```javascript
setTimeout(() => {
  console.log(0);
}, 0);

new Promise((resolve) => {
  console.log(1);
  setTimeout(resolve, 1000);
})
  .then(() => console.log(2))
  .then(() => console.log(3))
  .then(() => console.log(4))
  .then(() => console.log(5))
  .then(() => console.log(6));

setTimeout(() => {
  console.log(7);
}, 1000);

setTimeout(() => {
  console.log(8);
}, 0);

Promise.resolve().then(() => console.log(9));
Promise.resolve().then(() => console.log(10));
Promise.resolve().then(() => console.log(11));

// result => 1 9 10 11 0 8 2 3 4 5 6 7
```

或者如下代码也可以表明 Promise 决议后的 then 回调的执行顺序：

```javascript
p.then(() => {
  p.then(() => {
    console.log('C');
  });
  console.log('A');
});
p.then(() => {
  console.log('B');
});

// result => A B C
```

#### 过多调用或过多参数

处于某种原因，Promise 创建代码试图调用 resolve 或 reject 多次，或者试图两者都调用，那么 Promise 将只会接受第一次决议，并默默地忽略任何后续的调用。

在 Promise 构造函数里对 resolve 或 reject 传递多个参数，那么除了第一个参数以外，其余参数会被忽略。

#### Promise.resolve

如果向 `Promise.resolve` 传递一个非 Promise、非 thenable 的立即值，就会得到一个用这个值填充的 promise。

```javascript
// p1 与 p2 的行为完全一样：
const p1 = new Promise((resolve) => resolve(42));
const p2 = Promise.resolve(42);
```

而如果向 `Promise.resolve` 传递一个真正的 Promise，就只是返回这个 Promise，所以对于未知类型使用 `Promise.resolve` ，如果它恰好是一个 Promise 的话，是不会有任何额外开销的。

如果向 `Promise.resolve` 传递一个**非 promise 的 thenable** 的值，`Promise.resolve` 会展开这个值，且直到提取出一个非**类** Promise 的值，并返回用这个值填充的 Promise。

*Promise.resolve 可以接受任何 thenable 的值，将其解封为它的非 thenable 的值。*

从 `Promise.reolve` 得到的是一个真正的 Promise，是一个可信任的值。如果传入的已经是真正的 Promise，那么得到的就是它本身，所以通过 `Promise.resolve` 过滤来获得可信任的 Promise 完全没有坏处。（就是调用它一定会得到一个 Promise，对于类型来说一定是安全的）。

#### Promise 的链式流

多个 Promise 连接到一起表示一些系列的异步操作（`then().then().then()`），这种方式可以实现的关键在于以下两个 Promise 固有的行为特性：

* 每次调用 Promise 的 then，它都会创建并返回一个新的 Promise，因此我们可以将他们链接起来；
* 不管从 then 的完成回调（第一个参数）返回值是什么，它都会被自动设置为被链接 Promise 的完成。

```javascript
var p = Promise.resolve( 21 );
p
.then( function(v){
  console.log( v );    	// 21
  // 用值 42 完成链接的 Promise
  return v * 2;
})
// 这里是链接的 Promise
.then( function(v){
  console.log(v); 			// 42
});
```

简单总结下链式流程控制可行的 Promise 的特性：

* 调用 Promise 的 `then(..)` 会自动创建一个新的 Promise 从调用返回；
* 在完成或拒绝处理函数内部，如果返回一个值或抛出一个异常，新返回的（可链接的）Promise 就相应地决议；
* 如果完成或拒绝处理函数返回一个 Promise，它将会被展开，这样一来，不管它的决议值是什么，都会成为当前 `then(..)` 返回的链接 Promise 的决议值。

Promise 构造器的第一个参数回调会展开 thenable 或真正的 Promise，同 `Promise.resolve` 一样。

```javascript
var rejectedPr = new Promise( function(resolve,reject){
  // 用一个被拒绝的 promise 完成这个 promise
	resolve( Promise.reject( "Oops" ) );
} );
rejectedPr.then(
  function fulfilled(){
	// 永远不会到这里
  },
	function rejected(err){
    console.log( err ); // "Oops"
  }
);
```

请注意，**reject(..) 不会像 resolve(..) 一样对参数进行展开操作**。如果向 reject 传入一个 Promise/thenable 的值，它会把这个值原封不动地设置为拒绝理由。后续的拒绝处理函数收到的是实际传给 reject 的那个 Promise/thenable ，而不是其底层的立即值。

## 错误处理

`try...catch...` 是无法捕获异步错误的，它只能捕获同步的错误。

## `Promise.all`

严格来说，传给 `Promise.all([...])` 的数组中的值可以是 Promise、thenable，甚至是立即值。就本质而言，列表中的每个值都会通过 `Promise.resolve(..)` 的过滤，确保要等待的是一个真正的 Promise，所以立即值就会被规范化为以这个值构建的 Promise。

如果数组是空的话，主 Promise 就会立即完成。

## `Promise.race`

协调多个并发 Promise 的运行，只响应第一个完成的 Promise，其他 Promise 则被抛弃。

数组中每个值的类型同 `Promise.all` 相同，只是需要注意的是，如果数组为空的，`Promise.race` 永远不会决议，而不是立即决议。

## `then(..)` 和 `catch(..)`

`then(..)` 接受一个或两个参数，第一个参数用于完成回调，第二个用于拒绝回调。如果两者中的任何一个被省略或者作为非函数值传入的话，就会替换为相应的默认回调。

**默认完成回调**只是把消息传递下去，而**默认拒绝回调**则只是重新抛出其接受到的出错原因。

`catch(..)` 对于参数非函数类型时，和 `then(..)` 一致。只不过 `catch(..)` 仅接受一个参数。

需要注意的是，`then(..)` 和 `catch(..)` 都会创建并返回一个新的 Promise，这个 Promise 可以用于实现 Promise 链式流程控制。

## Promise 单一值

#### 分裂值

如果 Promise 需要返回多个信息，一般建议是构造一个值的封装（数组或对象）。但是有些时候可以将其分解为多个 Promise。

```javascript
function getY(x) {
  return new Promise(/* .. */);
}
function foo(bar, baz) {
  var x = bar * baz;
  return [
    Promise.resolve(x),
    getY(x)
  ];
}

Promise
  .all(foo(10, 29))
  .then(function(msgs) {
  	var x = msgs[0];
	  var y = msgs[1];
  
  	console.log(x, y);
	});
```

#### 展开/传递参数

从这部分中，获取了一个知识点，代码如下：

```javascript
function spread(fn) {
  return Function.prototype.apply.bind(fn, null);		// <- !!!
}

Promise
  .all(foo(10, 20))
	.then(spread(function(x, y) {
  	console.log(x, y);
	}));
```

这里面 `Function.apply.bind(fn, null)` 实际上就是在调用 `fn.apply(null)`，`bind` 方法改变了 `apply` 的执行上下文，同时也返回了一个新的函数（柯里化），这个函数的可以接受的参数就是 `apply` 的剩余参数（数组形式的参数）。

因此 `Promise.all(..).then(..)` 完成回调的参数是一个数组，这与 `apply` 的剩余参数一致。当然，这是在 ES6 提出解构之前的使用方法。




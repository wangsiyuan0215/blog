## 第三章 异步 I/O

操作系统的内核对于 I/O 只有两种方式：阻塞与非阻塞；

libeio: 采用线程池与阻塞 I/O 模拟异步 I/O，这也是 node 对于异步 I/O 采用的方式；

### 3.3 Node 的异步 I/O

#### 1. 事件循环

进程启动时，node 便会创建一个类似于 `while(true)` 的循环，每执行一次循环体的过程称为 Tick；

node 事件循环一次 Tick 的操作顺序图如下：

![事件循环](/Users/siyuan.wang/OneDrive/文档/blog/reading-notes/深入浅出 nodejs/event-loop.png)

由上图可知，node 的事件循环是由各个阶段按照一定顺序循环执行，那么对于 `poll` 阶段来说，是会影响代码里执行顺序的；

其中请注意：

`I/O callback` 阶段是关于 `close callback` / 定时器回调 / `setImmediate` 回调产生异常后调用的回调函数；

而真正的关于 I/O 的回调执行是在 `poll` 阶段，它主要有两个功能：

1. 在 `poll` 队列轮空时，为到达时限的定时器，返回 timer 阶段执行（检查定时器是否到达时限，如果到达时限则回到 timer 阶段执行定时器的回调函数）；
2. 执行 poll 队列中的事件的回调函数；

当事件进入 `poll` 阶段时，并且此时 timer 观察者为空，则：

- 如果存在 setImmediate 也就是 check 观察者不为空，则跳到 check 阶段执行；
- 如果 check 观察者也为空，则事件循环会停留在 `poll` 阶段，等待回调函数添加并执行；

> 此时通常会被问的问题是：setTimeout 和 setImmediate 放在一起谁会先执行？

```javascript
setTimeout(() => {
  console.log("timeout");
}, 0);

setImmediate(() => {
  console.log("immediate");
});
```

答案是不确定，因为在主模块（主程序）中调用，定时器会受到执行过程的约束，因此二者的执行顺序也会不用，有可能会跳到 timer 阶段执行，也有可能会执行 check 阶段；

> 那么如何保证二者执行的顺序一致呢？

将二者放到 I/O 事件的回调中，因为 `setImmediate` 会被放在 check 观察者队列中，在执行 I/O 回调后，由于 check 观察者不为空，因此事件循环会执行下一个阶段 - check 阶段，因此 `setImmediate` 会被先执行（不论 I/O 回调中在 `setImmediate` 前有多少个 `setTimeout`，最先执行的都是 `setImmediate` 的回调）；

```javascript
fs.readFile("test.txt", function (error) {
  setTimeout(function () {
    // -> timer
    console.log("setTimeout");
  }, 0);
  setImmediate(function () {
    // -> check
    console.log("setImmediate");
  });
});

// output:
// setImmediate
// setTimeout
```

事件循环本身是一个典型的「生产者/消费者模型」；

异步 I/O、网络请求等是事件的生产者，将这些不同类型的事件传递给观察者，而事件循环则从观察者那里取出事件并处理；

异步 I/O 事件的底层的非阻塞 I/O 其实是由阻塞 I/O + 线程池模拟的，因此可以看出来，node 的的底层并非是单线程；

事实上，从 JavaScript 发起调用到内核执行完 I/O 操作的过渡过程中，存在一种中间产物，叫做请求对象；

异步 I/O 执行主要被分为两个阶段：**提交请求**和**处理结果**；

异步 I/O 执行的主要流程是：
`文件模块 -> 核心模块 -> 内建模块 -> libnv（桥接层）-> 创建请求对象（保存回调函数、状态和结果） -> 送入线程池 -> CPU 阻塞 I/O 操作、完成 -> 改变请求对象的状态并将结果放入其中 -> 事件循环检测状态（完成） -> 执行回调`；

因此可以推测，异步 I/O 的回调执行有可能与最初的发起事件不在同一个 Tick；

对于 `setTimeout` 和 `process.nextTick` 这种非异步 I/O 来说，不需要系统底层参与，`setTimeout` 和 `setInterval` 属于 timer 观察者，`setImmediate` 属于 check 观察者，**`process.nextTick` 有自己的 nextTick 队列，和微任务相同，在每个事件阶段之后执行，但是执行的时机要早于微任务队列**；

在每一次 Tick 检查中，顺序是 timer 观察者 -> idle 观察者 -> I/O 观察者（这里特指 `poll` 阶段） -> check 观察者；

同时，微任务 + nextTick 队列是以数组的形式存储回调函数的，而 check 观察者是以链表的形式存储的，而处于其中的个体称为「请求对象」（保存回调函数、状态和结果）；

在每次 Tick 的过程中，会保证每次将微任务（包括 nextTick 队列）中的回调函数执行完，而 timer / check / I/O 观察者执行链表中的**一个回调函数**，这么设计的目的在于保证每轮循环能够快速的结束任务，防止 CPU 占用过多而阻塞后续的 I/O 调用的情况；

**node 与浏览器关于事件循环的区别在于：<br />**
node：微任务是在各个阶段之间执行；<br />
浏览器：微任务仅在执行完**一个宏任务**后执行，_主线程也是宏任务_；
## 第六章 理解 Buffer

### 6.1 Buffer 的结构

Buffer 是一个像 Array 的对象，但它主要用于操作字节；

Buffer 是 JavaScript 与 C++ 结合的模块，性能部分由 C++ 实现，非性能相关的部分由 JavaScript 实现；

Buffer 所占用的内存不是通过 V8 分配的，属于堆外内存，C++ 层面实现内存的申请；

由于 Buffer 太过常见，因此 node 在启动时就将它放到了 global 对象上，因此不需要使用 `require()` 即可直接使用；

#### 1. Buffer 对象

Buffer 对象类似于数组，它的元素是 16 进制的两位数，即 0 ~ 255（00 ~ FF）；

Buffer 是伪数组，如果对其下标元素赋值，

- 所赋的值如果小于 0，就需要加上 256 得到 0 至 255 之间的整数
- 所赋的值如果大于 255，就需要减去 256 得到 0 至 255 之间的整数；
- 所赋的值如果为小数，则舍去小数部分，只保留整数部分；

#### 2. Buffer 内存分配

基于 slab 分配机制；

实际上 node 在分配 Buffer 内存时，是以**8K 为界限区分 Buffer 是大对象还是小对象**，这个 8K 的值也就是每个 slab 的大小值；

如果是分配小 Buffer 对象的话，则直接创建一个 slab 单元（8K），内部所有 Buffer 对象在作用域内全部被释放，slab 单元才会被释放；
一个 slab 单元是允许多个 Buffer 对象同时存在的；如果多个 Buffer 对象所需要的内存大于 8K，则才会继续申请一个新的 slab 单元；

如果是分配大 Buffer 对象的话，将会分配一个 slowBuffer 对象作为 slab 单元，同时这个 slab 单元将会被 Buffer 独占；

### 6.2 Buffer 的转换

Buffer 对象可以与字符串之间相互转换；

目前创建 Buffer 对象使用的方法有：

```javascript
Buffer.from(arrayBuffer);
Buffer.from(arrayBuffer[, byteOffset[, length]]);
Buffer.from(buffer);
Buffer.from(object[, offsetOrEncoding[, length]]);
Buffer.from(string[, encoding]);
Buffer.alloc(size[, fill[, encoding]]);
Buffer.allocUnsafe(size);

// Buffer.alloc(size, fill) 永远不会使用内部的 Buffer 池
// 而 Buffer.allocUnsafe(size).fill(fill) 在 size 小于或等于 Buffer.poolSize 的一半时将会使用内部的 Buffer池。
```

在最新的 node 中，本书中部分 api 参数为 start 和 end 表示起始与终点，被更新为 offset 和 length，即起点与长度；

#### 1. 字符串互转 Buffer

字符串 -> Buffer：主要是通过构造函数来完成的

```javascript
new Buffer(str, [encoding]);
```

Buffer -> 字符串：通过 Buffer 对象的 toString() 可以将 Buffer 对象转换为字符串；

```javascript
buf.toString([encoding], [start], [end]);
```

Buffer 不支持的编码类型包括了中国常用的 GBK、GB2313 和 BIG-5 编码；

`fs.createReadStream` 方法中第二参数是配置，可以指定读取文件时 Buffer 的分配，`{ highWaterMark: [number] }`，`highWaterMark` 的值越大，读取的速度就越快；
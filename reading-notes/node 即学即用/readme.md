# 《Node 即学即用》初稿

## 第一章 Node.js 简介

node 是对高性能 V8 引擎的封装，使得 V8 在浏览器之外的环境依然能高效运行；

node 对高性能的追求，基于 V8 采用编译领域一些的最新技术，使得 JavaScript 的高级语言的代码在运行效率上能够接近用 C 等底层语言编写的代码，并且开发成本有所降低；

### 1.2 开始写代码

#### 1. Node REPL

了解 nodejs 的最佳方式是使用其提供的 REPL 模式（Real-Evaluate-Print-Loop，输入 - 求值 - 输出 - 循环），即交互式命令解析器；

## 第二章 编写有趣的应用

### 2.1 创建一个聊天服务器

### 2.2 我们也来编写个 Twitter

## 第三章 编写健壮的 Node 程序

### 3.1 事件循环

```javascript
const EE = require("events").EventEmitter;
const ee = new EE();

die = false;

ee.on("die", function () {
  die = true;
});

setTimeout(function () {
  ee.emit("die");
}, 100);

while (true) {}

console.log("done");
```

在这段代码中，`console.log('done')` 永远也不会执行，同时 `setTimeout` 的回调函数也永远也不会执行。

需要知道的是，node 是单线程，当 node 主模块执行 `while(true)` 语句时，会无限占用当前 node 的线程，因此不回去计算 timeout 的限时，也不会放开当前 `while` 语句执行 `console.log` 语句；

从 RAM（内存）中读取数据比作一只猫的重量，那么从硬盘上读取数据就比得上一头鲸了，而从网络上获取数据就像是 100 头鲸的重量；

### 3.2 模式

事件驱动编程主要是为了解决 I/O 问题；

当不需要 I/O 操作的内存数据时，node 也是可以使用完全过程式结构；

### 3.3 编写产品代码

使用 cluster 模块创建多子进程，同时主进程仅负责管理子进程，但是子进程的 I/O 操作是不会通过主进程，而是直接连接到子进程的；

在子进程中，`process` 指向的是当前子进程；

## 第四章 核心 API

### 4.1 Events

Events API 是所有其他 API 工作的基础模块；

#### 4.1.1 EventEmitter

所有的 node 的事件功能围绕着 EventEmitter，因为它的设计包含了其他类扩展所需要的接口类，EventEmitter 对象通常不会直接调用；

一般来说，想要使用 EventEmitter 的功能，通常自己定义一个类，然后通过 `extends` 或者是 `utils.inherits` 方法继承 EventEmitter 类；

```JavaScript
const utils = require('utils');
const events = require('events');

const Server = function () {
  console.log('server init');
};

utils.inherits(Server, events.EventEmitter);

const server = new Server();
server.on('abc', function () {
  console.log('abc');
});

// 通过使用 emit 方法触发 abs 事件
server.emit('abc');
```

需要注意的是，继承了 EventEmitter 类的其他类的实例对于事件是有作用域的，并且不存在全局事件；同时不同实例之间的事件是不会共享的；

#### 4.1.2 Callback 语法

`emit` 在 node 环境中的实现有两种情况：

1. 参数少于等于 3 个（包含 eventName），使用 call 方法调用回调同时会把第二、三个参数传递给回调；
2. 参数多于 3 个时，会使用 apply 方法通过将参数传递给回调函数；

需要注意的是，**node 调用 emit 时都直接使用了 this 上下文，这里的 this 指向的是 EventEmitter 类，并非是原来的调用上下文**；

### 4.2 HTTP

`checkContinue` 事件是客户端发送数据给服务端时，需要检查当前状态下能否继续；如果这个事件绑定了事件处理器，则 request 请求就不会被触发；

`upgrade` 事件在一个客户端请求协议升级时会触发，除非这个事件绑定了事件处理器，否则 http 服务器将拒绝 HTTP 升级请求；

`clientError` 事件会把客户端发送的 error 事件传递出来；

#### 4.2.2 HTTP 客户端

当需要使用 http 模块来发起 Web Service、连接文档数据库或是抓取网页等类似请求时（可以看做是客户服务端向远程服务器发送请求），应该是用 `http.clientRequest` 类；

具体使用就是：

```javascript
const http = require("http");

const options = {
  path: "/",
  port: 80,
  method: "GET",
};

const req = http.request(options, function (res) {
  console.log(res);
  // 可以通过 res.setEncode() 方法来指定响应数据的编码方式
  res.setEncode("uft8");
  // HTTP 请求的响应正文实际上是通过 response 对象的数据流获取的，
  // 因此订阅 response 对象的 data 事件，便于数据可用时就能处理
  res.on("data", function (data) {
    console.log(data);
  });
});

// 在使用 http.request 方法创建请求对象后，需要调用 end 方法，以确保 http 请求准备完毕
req.end();
```

`request` 会等待 `end()` 方法调用后，才会初始化 HTTP 请求，因为在此之前，node 不确定是否还会发送数据；

基于 `http.request|get` 等方法发送的请求，返回的 response 数据均是 Buffer 类型，二进制数据；可以通过 `res.setEncode()` 方法来指定响应数据的编码方式；

当发送 HTTP POST 和 PUT 请求时，需要使用 `req.write()` 方法将需要传递的数据上传到服务器（不会被缓存），但是在调用 `req.end()` 方法之前，服务器是不会响应你的数据请求的；

> 你可以把一个流（Stream）的 data 事件和 `ClientRequest.write()` 绑定在一起， 这样就能把数据以流的形式发送给服务器了。比如当需要把硬盘上的一个文件通过 HTTP 发送给远程服务器时，这会是个好主意。

#### 4.2.3 URL

有三个方法：`parse` | `format` | `resolve`；

`parse` 方法有两个参数，第一个参数就是 url 字符串，第二个参数是可选的布尔值，用来确定 queryString 是否该用 querystring 模块来解析；

- 如果为 `true`，`query` 返回的字段是一个对象；
- 如果为 `false`，同时也是默认值，返回的是一个字符串（开头没有 `?`）；

#### 4.2.4 querystring

querystring 模块是用来处理 query 字符串的简单辅助模块；

它的主要功能有 `parse` 和 `decode`，还包括一些内部辅助函数，如 `escape`、`unescape`、`unescapeBuffer`、`encode` 和 `stringify`；

- `parse` 方法是把请求参数从 string 类型转换为 object 类型；
- `stringify`：通过遍历对象的自身属性从给定的 obj 生成 URL 查询字符串，把 object 类型转换为 string 类型的请求；
- `encode`：`querystring.stringify` 方法的别名；
- `escape`：对 URL 查询字符串的特定要求进行了优化的方式对给定的 str 执行 URL 百分比编码，一般不会被单独使用；
- `unescape`：在给定的 str 上执行 URL 百分比编码字符的解码，一般也不会被单独使用；
- `decode`：`querystring.parse` 方法的别名；

### 4.3 I/O

I/O 模块是 node 有别于其他框架的核心模块之一；

#### 4.3.1 数据流（stream）

数据流分为可读、可写和可读写，所有的流都是 EventEmitter 的实例；

##### 可读数据流

基本上，可读数据流是与触发 data 事件相关的；

`fs.readFile` 方法会缓冲这个文件，如果想要以最小内存成本，可以使用 `fs.createReadStream()` 方法；

#### 4.3.2 文件系统

强烈建议使用异步的方法，除非使用 node 来创建命令行脚本；

`fs.unlink` 异步地删除文件或者符号链接，对空或非空的目录均不起作用，如要删除文件夹，请使用 `fs.rmdir()` 方法；

#### 4.3.3 Buffer

创建了一个 Buffer 后，它的大小就固定了，如果需要添加更多的数据，就必须要把老的 Buffer 复制到里一个更大的 Buffer 中；

即使 JavaScript 原生存在了字符串类型，在 node 程序中还是会经常使用 Buffer 来保存字符串；

在 UTF-8 中，字符串对应的长度与字节数的长度不一定一致，但是在 ASCII 中，二者是一定相同的；

在 UTF-8 中，中文会占 3 个字节（byte），而英文和数字会占 1 个字节，而在 ACSII 中，中文、英文和数字均占 1 个字节；

Buffer 是从内存直接分配的，并不会对原有的内容进行初始化，这与原生的 JavaScript 类型不同（它会把所有内存初始化）;

如果一个完整字符无法写入到 Buffer 中的话，就不会单独写入该字符的某个字节；

```javascript
var b = Buffer.alloc(1);
b.write("a");
console.log(b); // -> <Buffer 61>
b.write("é");
console.log(b); // -> <Buffer 61> 因为 é 在 utf-8 字符集中占 2 个字节，但是我们分配的 buffer 空间是 1 个字节
```

如果条件允许的话，当写入 UTF-8 时，`Buffer.write()` 写入的字符串一会一个 `NULL` 字符结尾，例子如下：

```javascript
var b = Buffer.alloc(5);
b.write("fffff");
console.log(b); // -> <Buffer 66 66 66 66 66>
b.write("ab", 1);
console.log(b); // -> <Buffer 66 61 62 00 66>
```

## 工具类 API

### 5.1 DNS

用域名代替 IP 地址作为事物的引用名称；

主要包括了两种方法：`resolve()` 和 `reverse()`；

dns 模块还提供了一个 `lookup()` 方法，可以从一个 A 记录查询中只返回一个 IP 地址；

### 5.2 加密

#### 5.2.1 Hashing

通过调用 `crypto.createHash()` 工厂方法创建一个 Hash 对象；

在哈希中使用数据时，可以调用 `hash.update()` 来生成数据摘要 `digest()`，当然你可以使用更多的数据不停地更新哈希，直到需要把它输出为止；

如果要把 hash 输出，只需要调用 `hash.digest()` 方法，这会把所有通过 `hash.update()` 输入的数据生成摘要并输出；

## 第八章 构建 Web 应用

#### 1. Cookie

Cookie 的处理分如下几步：

1. 服务端向客户端发送 cookie；
2. 浏览器将 cookie 保存；
3. 之后每次浏览器都会将 cookie 发向服务端；

Cookie 中的 httpOnly 选项会告知浏览器不允许通过脚本 `document.cookie` 修改这个 cookie 的值，实际上设置了 httpOnly 之后，这个 cookie 在 `document.cookie` 中是不可见的；

为静态组件使用不同的域名，一旦 cookie 过多会导致请求头较大，而且大多数的 Cookie 并不是每次都需要的，因此对于静态组件使用不用的域名可以起到一定的优化作用；

这是因为静态组件（文件）来说，其所涉及到的业务定位几乎不关心状态，而且**由于域名不同，还可以突破浏览器下载线程数的限制**；

#### 2. Session

Session 的数据仅保留在服务器端，客户端无法修改；

Session 的有效期通常较短，普遍设置的是 20 分钟，如果 20 分钟之内客户端与服务端没有交互的话，服务端就会将 session 数据删除；

#### 3. Basic 认证

Basic 认证是当客户端与服务端进行请求时，允许通过用户名和密码实现的一种身份认证方式；

如果有一个页面需要 basic 认证，它会检查请求报文头中的 Authorization 字段的内容；

同时，在 Basic 认证中，它会将用户名和密码组合，以 `username + ':' + password` 的形式进行 base64 编码；
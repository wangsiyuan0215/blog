# chrome 80+ 对 cookie 的改动点了解吗？

其实早在 Chrome 51 中就加入了 SamSite Cookie，其设计是用来阻止伪造的跨站点 Cookie 请求。

## 第三方 Cookie

第三方 Cookie 是由非当前访问的网页的服务器在用户浏览器中设置的 Cookie。通常第三方 Cookie 来自网页上的其他域的图片、广告等来源，也有可能是恶意网站诱骗用户发送请求（第三方网站引导用户发出的 Cookie），将个人信息和 Cookie 发送给目标网站（比如银行网站），它除了用于 CSRF 攻击，还可以用于用户追踪。

## SamSite

Chrome 51 在 Cookie 中加入了 SamSite 属性，用以限制第三方 Cookie，减少安全风险。

它有三个值：

* Strict：最为严格，严格禁用第三方 Cookie，跨站点时，任何情况下都不会发送 Cookie，换言之，只有当请求和网页的 URL 一致时，才会带上 Cookie；
* Lax：放宽了限制，大多数情况仍然是不发送 Cookie，同时**这是 Chrome 80 对 cookie 的改动，使 SamSite 的默认值为 Lax **，
    * 仅在以下几种情况下才会发送 Cookie：
        * `<a href="..."></a>` 链接；
        * `<line rel="prerender" href="..." />` 预加载；
        * `<form method="GET" action="...">` Get 请求的 form 表单提交；
    * 在以下几种情况不会发送 Cookie：
        * `<form method="POST" action="...">` Post 请求的 form 表单提交；
        * `<iframe src="..."></iframe>` Iframe；
        * `$.get("...")` Ajax 请求；
        * `<img src="...">` Image 图片请求。
* None：`Set-Cookie: widget_session=abc123; SameSite=None; Secure` 
    * 网站也可以显示关闭 SamSite 属性，将其设置为 `None`;
    * 前提是必须同时设定 `Secure` 属性（Cookie 只能通过 HTTPS 发送），否则无效；


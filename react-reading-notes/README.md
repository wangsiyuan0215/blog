# React 源码学习

> 本文阅读源码的方法借鉴于 JesseZhao1990 作者的文章：[《如何阅读 react 源码（一）》](https://github.com/JesseZhao1990/blog/issues/132)，在此十分感谢。

## 源码阅读方法：

- 首先把 react 源码克隆到本地。这里有一个小建议，那就是去阅读最新版的代码，因为 react 最新版本的代码组织结构更清晰，更易读。之前版本用的是 gulp 和 grunt 打包工具。仅项目的各种引用关系都理的让人头疼。源码结构可以先读一下官方文档的[说明](https://reactjs.org/docs/codebase-overview.html)。

- 利用 create-react-app 创建一个自己的项目

- 把 react 源码和自己刚刚创建的项目关联起来。到 react 源码的目录下运行 `yarn build`。这个命令会 `build` 源码到 build 文件夹下面，然后 `cd` 到 react 文件夹下面的 build 文件夹下。里面有 node_modules 文件夹，进入此文件夹。发现有 react 文件夹和 react-dom 文件夹。分别进入到这两个文件夹。分别运行 `yarn link`。此时创建了两个快捷方式：react 和 react-dom。

- `cd` 到自己项目的目录下，运行 `yarn link react react-dom`。此时在你项目里就使用了 react 源码下的 build 文件夹下的相关文件。如果你对 react 源码有修改，经过 `build` 之后，就能里面体现在你的项目里。你可以在 react 源码里打断点，甚至修改 react 源码。然后在项目里验证你的修改。

## 调试技巧

- 利用浏览器的开发者工具，在适当的地方打断点，进行追踪
- 全局搜索大法
- 充分利用 `console.trace`，打印出函数的调用栈，分析函数的调用关系

## 计划

暂定由 react -> react-dom 为主要学习路线，为了便于理解，针对每个常用方法整理出数据传递和函数调用流程图，可能有误，持续学习，持续跟进。

## 目录

1. [「随记」React 知识点](./notes/notes.md)；
2. [「思维导图」`ReactDom.render`](./notes/ReactDom.render.png)；
3. [「流程图」`React.Children.map`](./notes/React.Children.map.jpg)；
4. [「全局角度」借助 Didact 理解 React 的精髓](./notes/didact.js);

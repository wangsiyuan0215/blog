# 「随记」React 知识点

记录一些 React 相关知识点，以便于以后逐项学习研究。

1. `Virtual Dom(vDom)` 实际上是 js 对象，用 js 的对象表示真实的 dom 结构；
2. React Fiber 的 reconciler 协调算法实际上分为两个阶段：render & commit；
3. React 17 若无需使用 React 相关 API，可以不再写 `import React from ‘react’`；
4. 创建文本节点可以使用 `document.createTextNode` / `node.textContext` / `node.nodeValue`；
5. `<></>` 与 `<React.Fragment></React.Fragment>` 的区别在于 `React.Fragment` 是允许添加 key 属性以便于 diff 的时候明确当前层的唯一标识对应的 node，而 `<></>` 则不行；
6. diff 算法；
7. fiber 关于节点结构的思路值得参考，`{ return: 父节点，sibling：兄弟节点 }`，因此在遍历的时候，可以通过 `自身 -> 兄弟 -> 父亲.兄弟` 循环遍历；

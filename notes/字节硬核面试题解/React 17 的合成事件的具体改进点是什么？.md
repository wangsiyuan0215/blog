# React 17 的合成事件的具体改进点是什么？

React 17 的合成事件的具体改进点在于将事件委托的宿主从浏览器的 `document` 改为整个应用的渲染树的根节点 `root`，也就是：

```javascript
const root = document.getElementById('root');
ReactDOM.render(<App />, root);
```

 实际上，在 React 17 之前，对于合成事件的 `e.stopPropagation()` 是没有办法阻止原生事件的冒泡的（产生问题的场景来自于：https://juejin.cn/post/6844903988794671117#heading-10）。

这是因为，React 实现了一套自己的事件管理机制。如下代码：

```javascript
class TaskEvent extends Reac.PureComponent {
  render() {
    return (
      <div
        onClick={() => {
          console.log('我是注册事件')
        }}
      >
        呵呵呵
      </div>
    )
  }
}
```

在上述 JSX 中的，`<div onClick={() => console.log('我是注册事件')}>呵呵呵</div` 中的 `onClick` 绑定的事件实际上就是一个 React 的合成事件。从用户点击这个 `div` 到触发这个 `onClick` 事件的回调，它实际的流程是这样的：

* 在组件创建和更新的时候，会先将这个事件（`listenTo`）委托注册到 `document` 并存于 `listenrBank`（事件池）；
* 用户触发这个事件时，原生事件优先触发，通过事件冒泡机制，冒泡到 `document` 上；
* `document` 在收到这个冒泡事件后，找到原生事件目标 DOM 和 React Element（DOM 上会有 `__reactInternalInstance` 属性，它指向 React Element）；
* React 从当前的 React Element 向上遍历所有父组件（直到 React 根节点），将所有事件的 callback 存于 `eventQueue`；
* 根据事件类型构建 event 对象，遍历执行 `eventQueue`。

因此，在 React 17 之前，在事件中使用 `e.stopPropagation()` 并不会阻止原生事件冒泡，仅会阻止合成事件的冒泡；

但是在 React 17 之后，由于事件委托宿主的变更，因此 document 虽然接收到了原生事件的冒泡，但是由于 React 并没有在它进行事件委托，因此不会触发任何事件的回调（除非手动在 document 创建了事件，但是也只是响应原生事件的冒泡）。

事件委托宿主的更改主要是为了解决在 React 17 之前多版本 React 合成事件共用一个 `document` 导致的问题：

>  如果嵌套树结构中阻止了事件冒泡，但外部树依然能接收到它。

因为多个版本的 React 的事件委托都在 `document`。


# react 17 和 18 分别做了什么优化

## React 17

1. 渐进式升级；
2. 事件委托的变更；
    1. React 17 不会再将事件处理绑定到 document 上，而是将事件处理添加到渲染 React 树的根 DOM 容器中；
    2. 在 React 16 中将大多数的事件绑定到 document `document.addEventListener()`，但是在 React 17 中会通过调用 `rootNode.AddEventListener()` 来代替；
3. 全新的 JSX 的转换：
    1. 与 babel 进行合作，可以单独使用 JSX 而无需引入 React；
    2. 旧的 JSX 转换器会把 JSX 转换为 `React.createElement()` 调用；
    3. React 17 在 package 中引入了两个新如何，这些入口只会被 Babel 和 TypeScript 等编译器使用。新的 JSX 转换器不会将 JSX 转换为 `React.createElement`，而是自动从 React 的 package 中引入的新的入口函数并调用。
4. Suspense:
    1. React 16 中仅支持 lazy 动态加载组件和 Code spliting;
    2. 可以借助 react-cache 在 `<Suspense>` 组件中异步加载数据；
6. 去除事件池，在 React 16 及早期版本，使用者必须使用 `e.persist()` 才能正确读取浏览器事件对象；
7. React 17 中副作用清理函数总会异步执行，如果要卸载组件，则清理会在屏幕更新后运行，与此同时，在运行下一个副作用之前，会清理所有副作用；

## React 18

1. 并发渲染（concurrent render）：
    
    1. `createRoot` 新增的 root API，更加高效地管理不同的根节点，同时使用该 API 意味着开启了 React 并发模式；
    2. `useTransition` 新增的 Hook，用以解决大量状态计算带来的 UI 渲染超载的问题；
    3. `useDeferredValue` 新增 Hook，使用上一次或延迟多久之前的数据；
    4. `<SuspenseList>`：控制 Suspenses 全部 resolved 后渲染顺序，新增一个 prop `revealOrder`：
        1. 不设置：哪个完成就先渲染哪个；
        2. `together`：类似于 `Promise.all`，都 resolved 之后同时渲染；
        3. `forwrad`，按照 `<Suspense>` 的顺序渲染，如果设置了 `forward` 还可以设置 `tail`。
    
2. [自动批处理](https://github.com/reactwg/react-18/discussions/21)以减少渲染；

    1. 在 React 17 中：
       1. 仅在 Browser Event 中  setState 才会批量更新 states，在某一个时机批量地更新状态，使组件仅重新渲染一次；
       2. 但是在 Browser Event 外，每调用一次 setState 则执行一次重新渲染；

    1. 区别于 React 17 的 Browser Event 外的改变状态，React 18 现在也可以在 timeouts / promises / event handlers / any other events 也可以进行批量更新；

3. Suspense 的 SSR 支持；

4. 修复 Suspense 的怪异行为；

5. React 新的 Hooks：
    1. `useQpaquleIdentifier()`: 生成 UUID，可以用于 Label 的 htmlFor 和 input 的 id 绑定，主要用在交互类的组件中，避免显示地指定 id；
    2. `useTransition`: `const [isPending, startTransition] = useTransition();`

6. React-dom 的新的 API：
    1. `createRoot(RootContainerElement).render(RootReactNode)`;
    2. `flushSync`: `flushSync(() => setState(c = c + 1)) // React will re-render now`

7. 不在支持 IE 浏览器，如果仍然想要支持 IE 建议使用 React 17。
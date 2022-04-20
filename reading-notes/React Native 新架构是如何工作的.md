## **Fabric 是 React Native 新架构的渲染系统。**

核心原理是在 C++ 层统一更多的渲染逻辑，提升与宿主平台的互操作性；

## 与老架构 React Native 的优点：

1. 老架构中，React Native 的布局是**异步**的，会导致渲染嵌套的 React Native 视图时会有”布局抖动“。而新架构中，渲染视图时同步的；
2. 借助多优先级和同步事件的能力，渲染器可以提高与用户交互的优先级（Fiber）；
3. React Suspense；
4. 可以使用 React 18 中的 React Concurrent 功能；
5. React Native 服务端渲染；
6. 性能提升 - 拍平视图层级；
7. 跨平台特性更强，保证一致性；
8. 借助 JSI （JavaScript Interface）与宿主平台通信；

## React Native 渲染器大致可以分为三个阶段：

* 渲染（render）：
    * In React: React code  >>>  React  Element Tree ;
    *  In C++: React Element Tree >>> React Shadow Tree;
* 提交（commit）
    * React Shadow Tree 创建完全后，会触发一次 commit
    * 将 React Element Tree & React Shadow Tree 提升为”下一棵要挂载的树“；
    * 包含了布局信息计算；
    * 状态更新后，执行 树对比（Diff），其中视图拍平算法是该 Diff 算法的一部分。
* 挂载（mount）
    * 树提升：将 “下一棵要渲染的树” 提升为 “先前渲染的树”；
    * 转化为宿主平台的视图树（Host View Tree）；

**React Element Tree**：通过 JavaScript 中的 React 创建的，有一系列 React 元素组成。同时，React 元素分为两类：

1. React 复合组件实例（React Composite Comp）；
2. React 宿主组件（React Host Comp）；

二者都仅存在与 JavaScript 中。

**React Shadow Tree**：是通过 Fabric 渲染器创建的，由一系列 React 影子节点组成。每个 React 影子节点都是一个对象，代表已经挂载的 React 宿主组件。React Shadow Tree 是不可变的，更新任意的 React Shadow Node 渲染器都会创建一个新的 React Shadow Tree （从当前 Node 到根节点的树）。

**Host View Tree**：宿主视图树就是一系列的宿主视图。每个宿主视图的大小和坐标位置是通过布局引擎 Yoga 计算出来的，而样式和内容信息是从 React Shadow Tree 中得到的。

总的来说，React Native 渲染器渲染阶段大致分为三种场景：

1. 初始化渲染；
2. React 状态更新；
3. React Native 渲染器的状态更新；

## 初始化渲染：Render > Commit > Mount

* Render 阶段：
    * React 会将 React 元素简化为最终的 React 宿主组件。通过递归地调用函数组件或者类组件的 render 方法，直到所有组件都被调用过，此时会拥有一棵 React Element Tree；
    * 在简化过程中，每调用一个 React 元素，渲染器会 **同步** 的创建 React 影子节点，需要注意的是，这个过程只会发生在 React 宿主组件上，不会发生在 React 复合组件上；
    * React 为两个 React Element Node 创建父子关系的同时，渲染器也会为对应的 React Shadow Node 创建一样的父子关系。
* Commit 阶段：
    * 布局计算：计算每个 React Shadow Node 的位置和大小；
    * 树提升：从 “新树” 提升到 “下一棵树”，并且在 UI 线程下一个 tick 进行挂载；
    * 这些操作都是在后台线程中异步执行。
* Mount 阶段：
    * 树对比（Tree Diffing）：C++ 计算，会对比 “已经渲染的树” 和 “下一棵树” 之间的差异。
    * 树提升：从 “下一棵树” 到 “已渲染的树”；
    * 视图挂载：发生在原生平台的 UI 线程中。
    * **Mount 阶段所有操作都是在 UI 线程中同步执行的。**如果 Commit 阶段是在后台线程执行的，那么 Mount 阶段会在后台线程的下一个 tick 执行；如果 Commit 阶段是在 UI 线程执行，那么挂载阶段也是在 UI 线程执行；

## React 状态更新：Render > Commit > Mount

* Render 阶段：
    * 总的来说，React 要创建一个包含新状态的新的 React Element Tree，它就需要复制所有变更的 React Element Nodes 和 React Shadow Nodes。复制后，再提交新的 React Element Tree；
    * React Native 渲染器利用结构共享的方式，将不可变特性的开销减少到最小。为了更新 React Element 的新状态，从该元素到根元素路径上的所有元素都需要被复制，但是 React 只会复制有新属性、新样式或新子元素的 React 元素（其他元素不会被复制，会由新、旧树共享）；
* Commit 阶段：
    * 布局计算：和初始化渲染计算布局类似，唯一不同的是布局计算可能会导致共享的 React 影子节点被复制（这是由于共享 React 影子节点的父节点引起了布局改变，共享的 React 影子节点的布局也可能发生改变）；
    * 树提升：从 “新树” 提升到 “下一颗渲染数”；
    * 树对比：计算 “先前渲染的树” 和 “下一棵树” 的区别，结果是原生视图的变更操作。（**相比初始化渲染阶段，实际上 Diff 是发生在 Commit 阶段，同时是异步的**）
* Mount 阶段：
    * 树提升：“下一棵树” 提升为 “先前渲染的树”；
    * 视图挂载；

## React Native 渲染器状态更新

对于 React 影子树中的大多数信息而言，React 是唯一所有方且是唯一事实源，而且所有来源于 React 的数据都是单向流动的（React Shadow Tree 不可变性）。

但是有个例外就是 C++ 组件可以拥有状态，且该状态不直接暴露给 JavaScript，实际上只有复杂的宿主组件才会用到 C++ 状态，绝大多数宿主组件都不需要此功能。

C++ 状态更新与 React 状态更新类似，但是有两点不同：

1. 不涉及 React，因此没有 Render 阶段；
2. 更新可以源自和发生在任何线程，包括主线程；

* Commit 阶段：
    * 反复尝试获取 C++ 状态更新的影子节点的最新版本，并用新状态复制它，将复制后的影子节点提交给影子树。
    * 若在此期间，React 执行了另一次提交，或者其他 C++ 状态有了更新，那么本次 C++ 状态提价失败；
    * 这是 React Native 渲染器会多次重试 C++ 状态更新，直到提交成功。
* Mount 阶段：
    * 同 React 状态更新的 Mount 阶段相同。

## 跨平台

新架构中，React Native 渲染器使用了 C++ core 渲染实现了跨平台共享。而老架构则是将 React 影子树、布局逻辑、视图拍平算法是在各个平台单独实现。

优点是：

1. 单一实现降低了开发和维护的成本；
2. 提升了 React 影子树的性能；
3. React 影子节点在 C++ 中占用的内存较小；

## 视图拍平算法

“只参与布局” 的 React 元素是指仅参与视图布局，并不会在屏幕中渲染任何内容的 React 元素，渲染器实现了一种视图拍平的机制来合并或拍平这类节点，减少屏幕中宿主视图的层级深度。比如：

```react

function MyComponent() {
  return (
  	<View>  // ReactAppComponent
    	<View style={{ margin: 10 }}> // ContainerComponent
        	<View style={{ margin: 10 }}> // TitleComponent
            <Image {...} />
						<Text {...}>This is a title</Text>
          </View>
    	</View>
    </View>
  );
}
 
```

上述代码中的 `ContainerComponent` 和 `TitleComponent` React 元素，在屏幕上渲染只是为了提供 10 像素的外边距，这种元素即为 “只参与布局” 的 React 元素。

在视图拍平算法中，会将这两个元素拍平，并将他们的样式结果合并到 `ReactAppComoponent` 元素中。


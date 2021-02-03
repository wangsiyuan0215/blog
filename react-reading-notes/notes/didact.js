/**
 * !! 由于 React 的源码实在是太难读了，因此借鉴下 didact 的 mini react 源码，作为阅读 React 源码的辅助
 */

//! 我在这里做手动做一个变量提升，用于阅读
//! 下一个工作单元
let nextUnitOfWork = null
//! 当前根节点
let currentRoot = null
//! 处于工作状态的 fiber 根节点
let wipRoot = null
let deletions = null

//! 处于工作状态的 fiber 节点（与 wipRoot 区分开）
let wipFiber = null
let hookIndex = null

//! 创建 fiber 节点 -> 也是 jsx 转换所使用的函数
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        //! 根据 child 的类型判断是否 Text 类型的 fiber 节点
        typeof child === "object"
          ? child
          : createTextElement(child)
      ),
    },
  }
}

//! 创建 Text 类型的 fiber 节点
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

//! STEP 12 -> 创建真实 dom 对象
function createDom(fiber) {
  //! 这里根据 type 类型分别创建 TEXT 和 Element 类型的 DOM 对象，
  //! 需要注意的是，这里面的 DOM 均是 DOM 对象，并非指向真实挂载在 document 文档流的 DOM
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type)

  //! 创建 DOM 对象后，处理它的事件和属性（由于是新创建的，因此没有旧的 props 和事件）
  updateDom(dom, {}, fiber.props)

  return dom
}

const isEvent = (key) => key.startsWith("on")
const isProperty = (key) =>
  key !== "children" && !isEvent(key)
const isNew = (prev, next) => (key) =>
  prev[key] !== next[key]
const isGone = (prev, next) => (key) =>
  !(key in next)

//! STEP 9 -> 更新 DOM 函数，当前函数内部处理 props 和 attributes，由于是简化版本，缺少了事件代理
function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      (key) =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach((name) => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = ""
    })

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name]
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}

//! STEP 7 -> commitRoot 提交阶段（React fiber 的算法是分为 reconciler 和 commit 两个阶段）
function commitRoot() {
  //! 首先针对需要删除的节点进行 commitWork，jump to STEP 8
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

//! STEP 8 -> commit 工作
function commitWork(fiber) {
  //! 若 fiber 节点不存在，则直接返回；
  if (!fiber) {
    return
  }

  //! 获取当前 fiber 的父节点
  let domParentFiber = fiber.parent
  //! 获取 fiber 父节点对应的真实 DOM 元素，如果未找到则继续向上寻找
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom

  //! 如果 fiber.effectTag 是替换类型，同时 fiber 对应的 dom 节点存在，则直接将其 dom 节点 append 到当前 fiber 父节点的 dom 中
  if (
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom != null
  ) {
    domParent.appendChild(fiber.dom)
  } else if (
    //! 若 fiber.effectTag 是更新类型，同时 fiber 对应的 dom 节点存在，则需要执行 updateDom 函数 jump to STEP 9
    fiber.effectTag === "UPDATE" &&
    fiber.dom != null
  ) {
    updateDom(
      fiber.dom,
      //! 传入旧镜像 fiber 节点的 props
      fiber.alternate.props,
      fiber.props
    )
    //! 若 fiber.effectTag 是删除类型，则需要执行 commitDeletion 函数 jump to STEP 10
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent)
  }

  //! 递归调用 fiber 节点的子节点与兄弟节点，先调用子节点，再处理兄弟节点
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

//! STEP 10 -> 删除 DOM 节点操作
function commitDeletion(fiber, domParent) {
  //! 如果当前 fiber 存在真实 dom，则 removeChild 删除
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    //! 否则，意味着当前 fiber 节点可能是个函数类型的 fiber 节点，则需要删除它的子 fiber 节点（以当前 fiber 为根节点的整棵树直接砍掉）
    commitDeletion(fiber.child, domParent)
  }
}

//! STEP 2 -> render 函数
/**
 * !!最初渲染函数 - 入口
 *
 * @param {virtual dom} element
 * @param {HTMLElement} container
 */
function render(element, container) {
  //! 初始化根节点，wipRoot 已经在全局中声明过了
  wipRoot = {
    //! dom 节点对象，用于存储真实的挂在 DOM
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  }
  deletions = []
  //! 下一个工作单元，初始时指向全局的根节点 wipRoot
  nextUnitOfWork = wipRoot

  //! 到此似乎程序结束了，但是需要注意的是，从 didact 被加载后，就会执行一个方法 requestIdleCallback(workLoop)
  //! requestIdleCallback 是根据当前浏览器当前帧的空闲状态来进行执行相应的回调函数
  //! 我们在这里假设以下，从浏览器加载完 didact 之后浏览器是处于空闲状态的
}

//! STEP 3 -> workLoop
function workLoop(deadline) {
  //! 是否应该阻断进程，yield 本身是关键字，它的意义就是中断当前进程并等待继续
  let shouldYield = false
  //! 循环条件：下一个工作单元存在并且不应该中断当前进程（中断当前进程意味着 React 会把控制权还给浏览器）
  while (nextUnitOfWork && !shouldYield) {
    //! 执行工作单元 performUnitOfWork（jump to STEP 4）
    //! 初始化时，nextUnitOfWork 就是 wipRoot
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    //! 根据 deadline 的 剩余时间 判断是否应该中断进程
    shouldYield = deadline.timeRemaining() < 1
  }

  //! 当全局的 fiber 树更新完成，此时 nextUnitOfWork = undefined
  if (!nextUnitOfWork && wipRoot) {
    //! 进入 commit 阶段（同步），jump to STEP 7
    commitRoot()
  }

  //! 继续执行 requestIdleCallback 监听下一帧，
  //! 当 commitRoot 执行完毕后，才会继续监听下一帧
  requestIdleCallback(workLoop)
}

//! didact 加载后执行 requestIdleCallback 函数，对每一帧进行监听，当发现空闲时间执行参数 workLoop 函数
requestIdleCallback(workLoop)

//!  STEP 4 -> 执行工作单元
function performUnitOfWork(fiber) {
  //! 根据 fiber 的 type 判断是否是函数组件
  const isFunctionComponent =
    fiber.type instanceof Function

  //! 如果是函数式组件的话，执行 updateFunctionComponent 函数
  //! 需要注意到的是，这里是同步执行的，也就说需要先 update 相应的组件，之后才可以继续向下进行
  if (isFunctionComponent) {
    //! 由于 Counter 是函数式组件，因此 jump to STEP 5
    updateFunctionComponent(fiber)
  } else {
    //! 如果不是函数式组件的话，执行 updateHostComponent 函数
    //! 这里因为是简化版本的 React，因此对于 组件 的类型仅限于 函数式组件 和 原生组件
    //! jump to STEP 11
    updateHostComponent(fiber)
  }
  //! 【读完当前函数的注释请再读这里】以下这些步骤，其实是在更新全局变量中的 nextUnitOfWork
  //! 也就是说，nextUnitofWork 是将 React fiber 所有节点可以被处理的总线

  //! 如果 fiber 节点存在子节点，则直接中断当前函数，并返回 fiber 子节点 -> nextUnitOfWork
  //! 还有一点很巧妙得是，在执行完 reconcileChildren 之后，如果 fiber.child 存在，则会继续对 child 进行 performUnitOfWork
  if (fiber.child) {
    return fiber.child
  }
  //! 如果 fiber 不存在子节点，那么根据 sibling 去查找同级的兄弟节点
  let nextFiber = fiber
  while (nextFiber) {
    //! 如果找到兄弟节点，则将兄弟 fiber 节点 -> nextUnitOfWork
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    //! 如果未找到，则向父级节点查找父节点的兄弟节点
    nextFiber = nextFiber.parent
  }

  //! 如果以上判断都不满足，则返回 undefined，认为 wipRoot 节点以及其所有子 fiber 节点均已更新完成
}

//! STEP 5 -> 更新函数式组件
function updateFunctionComponent(fiber) {
  //! 更新 wipFiber 为当前 fiber 节点
  wipFiber = fiber
  //! 将 hookIndex 置为初始值 0，至于为什么将它置为 0，稍后会涉及到
  hookIndex = 0
  //! 初始化 wipFiber 的 hooks 的数组
  wipFiber.hooks = []
  //! 这里还记得 fiber.type 是什么类型嘛？是 Function，因此需要将 props 作为参数执行 fiber.type
  const children = [fiber.type(fiber.props)]
  //! 协调构建子 fibers 组件（jump to STEP 6），fiber 是旧的，children 是新的
  reconcileChildren(fiber, children)
  //! 当 reconcileChildren 执行完成，此时当前 fiber 节点的子节点已经更新完成
}

function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex]
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }

  const actions = oldHook ? oldHook.queue : []
  actions.forEach((action) => {
    hook.state = action(hook.state)
  })

  const setState = (action) => {
    hook.queue.push(action)
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    }
    nextUnitOfWork = wipRoot
    deletions = []
  }

  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state, setState]
}

//! STEP 11 -> 更新原生组件
function updateHostComponent(fiber) {
  //! 由于是原生组件，当前 fiber 的 dom 字段若为空或不存在的话，需要进行创建，jump to STEP 12
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  //! jump to STEP 6
  reconcileChildren(fiber, fiber.props.children)
}

//! STEP 6 -> 协调子组件
//! react 这个阶段进行了组件树的 diff
//! element 是新的 fiber 节点
//! 请注意，这里协同子 fiber 的算法仅针对具备同一个父 fiber 节点的子 fiber 节点
function reconcileChildren(wipFiber, elements) {
  let index = 0
  //! 获取用于 diff 的旧 fiber 节点（镜像）
  let oldFiber =
    wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (
    index < elements.length ||
    oldFiber != null
  ) {
    const element = elements[index]
    let newFiber = null

    //! ↓↓↓↓ 简化版本的 diff 算法 ↓↓↓↓

    //! 首先判断旧 fiber 节点与新 fiber 节点的类型是否相同
    const sameType =
      oldFiber &&
      element &&
      element.type == oldFiber.type

    //! 若相同，直接将旧的 fiber 更新为新的 fiber 节点（不考虑 key）
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }
    //! 若新节点存在但是不相同类型不同，直接进行替换
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      }
    }
    //! 如果旧节点存在，并且与新接点类型不同，则进行删除
    if (oldFiber && !sameType) {
      //! 将 effectTag 标记为 DELETION
      oldFiber.effectTag = "DELETION"
      //! 并将当前旧节点放入删除数组中
      deletions.push(oldFiber)
    }
    //! 以上就是 diff 算法的基本逻辑：更新、替换和删除

    //! diff 的原则是 深度优先、同级比较，因此接下来进行旧节点的兄弟节点进行 diff
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    //! 如果是同级下的第一个节点，则直接将新 fiber 放到 wipFiber 的 child 链表里
    if (index === 0) {
      wipFiber.child = newFiber
    } else if (element) {
      //! 除了同级下的第一个节点外，其他新 fiber 节点放到上一个新 fiber 的兄弟节点
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

const Didact = {
  //! 提供给 babel
  createElement,
  render,
  useState,
}

/** @jsx Didact.createElement */
function Counter() {
  const [state, setState] = Didact.useState(1)
  return (
    <h1 onClick={() => setState((c) => c + 1)}>
      Count: {state}
    </h1>
  )
}
const element = <Counter />
const container = document.getElementById("root")

//! STEP 1 -> render 函数作为入口，此过程忽略将 jsx 转换为 vDom 对象的过程
Didact.render(element, container)

import { Fragment, Text } from "./vnode";
import { ShapeFlags } from "./../utils/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { effect } from "../reactivity/effect";
import { queueJobs } from "./scheduler";

export function createRenderer(options) {
  const { createElement, createText, setText, patchProp, insert, remove } =
    options;

  function render(vnode, container, parentComponent) {
    patch(null, vnode, container, parentComponent, null);
  }

  // n1 old_vnode b2 new_vnode
  function patch(n1, n2, container, parentComponent, anchor) {
    const { type, shapeFlags } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlags & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor);
        } else {
          const textNode = createText(n2);
          container.append(textNode);
        }
    }
  }

  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processText(n1, n2, container) {
    const textNode = (n2.el = createText(n2.children));
    container.append(textNode);
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function mountElement(n2, container, parentComponent, anchor) {
    const { type, props, shapeFlags, children } = n2;

    const el = (n2.el = createElement(type));

    if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent, anchor);
    } else if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    }

    for (const key in props) {
      const val = props[key];
      patchProp(el, key, "", val);
    }

    insert(el, container, anchor);
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    const el = (n2.el = n1.el);

    // patch children 所以 container 传递 el
    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const { shapeFlags: shapeFlags1, children: c1 } = n1;
    const { shapeFlags: shapeFlags2, children: c2 } = n2;
    if (shapeFlags2 & ShapeFlags.TEXT_CHILDREN) {
      if (shapeFlags1 & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      }

      if (c1 !== c2) {
        setText(container, c2);
      }
    } else {
      if (shapeFlags1 & ShapeFlags.ARRAY_CHILDREN) {
        // diff
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      } else {
        //  新array 旧text
        setText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      }
    }
  }

  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    let i = 0,
      e1 = c1.length - 1,
      e2 = c2.length - 1;

    function isSameVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key;
    }

    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }

    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    if (i > e1) {
      if (i <= e2) {
        const nextPost = e2 + 1;
        const anchor = nextPost < c2.length ? c2[nextPost].el : null;

        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      if (i <= e1) {
        while (i <= e1) {
          remove(c1[i].el);
          i++;
        }
      }
    } else {
      // 中间对比
      // 新增 删除 移动

      const keyToNewIndexMap = new Map();
      const toBePatched = e2 - i + 1;
      let patched = 0;
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
      let moved = false;
      let newMaxIndexSoFar = 0;

      for (let s2 = i; s2 <= e2; s2++) {
        const nextChild = c2[s2];
        keyToNewIndexMap.set(nextChild.key, s2);
      }

      let newIndex;

      for (let s1 = i; s1 <= e1; s1++) {
        const prevChild = c1[s1];

        if (patched >= toBePatched) {
          remove(prevChild.el);
          continue;
        }

        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (let j = i; j <= e2; j++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        if (!newIndex) {
          remove(prevChild.el);
        } else {
          if (newIndex >= newMaxIndexSoFar) {
            newMaxIndexSoFar = newIndex;
          } else {
            moved = true;
          }

          newIndexToOldIndexMap[newIndex - i] = s1;
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];

      for (
        let index = toBePatched - 1, j = increasingNewIndexSequence.length - 1;
        index >= 0;
        index--
      ) {
        const nextIndex = index + i;
        const nextChild = c2[nextIndex];
        const nextPost = nextIndex + 1;
        const anchor = nextPost < c2.length ? c2[nextPost].el : null;

        if (newIndexToOldIndexMap[index] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          if (j < 0 || increasingNewIndexSequence[j] !== index) {
            insert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }

  function unmountChildren(children) {
    children.forEach(({ el }) => {
      remove(el);
    });
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];

        if (prevProp !== nextProp) {
          patchProp(el, key, prevProp, nextProp);
        }
      }
      if (Object.keys(oldProps).length > 0) {
        for (const key in oldProps) {
          const prevProp = oldProps[key];

          if (!(key in newProps)) {
            patchProp(el, key, prevProp, null);
          }
        }
      }
    }
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((child) => {
      patch(null, child, container, parentComponent, anchor);
    });
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor);
    } else {
      patchComponent(n1, n2);
    }
  }

  function mountComponent(initialVNode, container, parentComponent, anchor) {
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    ));

    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container, anchor);
  }
  function patchComponent(n1, n2) {
    const instance = (n2.component = n1.component);

    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      n2.el = n1.el;
      n2.vnode = n2;
    }
  }
  function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;
    //   const emits = component!.emitsOptions;

    // 这里主要是检测组件的 props
    // 核心：只要是 props 发生改变了，那么这个 component 就需要更新

    // 1. props 没有变化，那么不需要更新
    if (prevProps === nextProps) {
      return false;
    }
    // 如果之前没有 props，那么就需要看看现在有没有 props 了
    // 所以这里基于 nextProps 的值来决定是否更新
    if (!prevProps) {
      return !!nextProps;
    }
    // 之前有值，现在没值，那么肯定需要更新
    if (!nextProps) {
      return true;
    }

    // 以上都是比较明显的可以知道 props 是否是变化的
    // 在 hasPropsChanged 会做更细致的对比检测
    return hasPropsChanged(prevProps, nextProps);
  }

  function hasPropsChanged(prevProps, nextProps): boolean {
    // 依次对比每一个 props.key

    // 提前对比一下 length ，length 不一致肯定是需要更新的
    const nextKeys = Object.keys(nextProps);
    if (nextKeys.length !== Object.keys(prevProps).length) {
      return true;
    }

    // 只要现在的 prop 和之前的 prop 不一样那么就需要更新
    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys[i];
      if (nextProps[key] !== prevProps[key]) {
        return true;
      }
    }
    return false;
  }
  function setupRenderEffect(instance, initialVNode, container, anchor) {
    instance.update = effect(
      () => {
        if (!instance.isMounted) {
          const { proxy } = instance;
          const subTree = (instance.subTree = instance.render.call(proxy));
          patch(null, subTree, container, instance, anchor);

          initialVNode.el = subTree.el;

          instance.isMounted = true;
        } else {
          const { proxy, next, vnode } = instance;
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next);
          }

          const subTree = instance.render.call(proxy);
          const preSubTree = instance.subTree;
          instance.subTree = preSubTree;

          patch(preSubTree, subTree, container, instance, anchor);
        }
      },
      {
        scheduler() {
          queueJobs(instance.update);
        },
      }
    );
  }

  function updateComponentPreRender(instance, nextVnode) {
    instance.vnode = nextVnode;
    instance.next = null;
    instance.props = nextVnode.props;
  }

  return {
    createApp: createAppApi(render),
  };
}

function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}

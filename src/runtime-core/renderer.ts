import { Fragment, Text } from "./vnode";
import { ShapeFlags } from "./../utils/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { effect } from "../reactivity/effect";

export function createRenderer(options) {
  const { createElement, createText, patchProp, insert } = options;

  function render(vnode, container, parentComponent) {
    patch(null, vnode, container, parentComponent);
  }

  // n1 old_vnode b2 new_vnode
  function patch(n1, n2, container, parentComponent) {
    const { type, shapeFlags } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlags & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        } else {
          const textNode = createText(n2);
          container.append(textNode);
        }
    }
  }

  function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2.children, container, parentComponent);
  }

  function processText(n1, n2, container) {
    const textNode = (n2.el = createText(n2.children));
    container.append(textNode);
  }

  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      patchElement(n1, n2, container, parentComponent);
    }
  }

  function mountElement(n2, container, parentComponent) {
    const { type, props, shapeFlags, children } = n2;

    const el = (n2.el = createElement(type));

    if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent);
    } else if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    }

    for (const key in props) {
      const val = props[key];
      patchProp(el, key, "", val);
    }

    insert(el, container);
  }

  function patchElement(n1, n2, container, parentComponent) {
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    const el = (n2.el = n1.el);
    patchProps(el, oldProps, newProps);
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

  function mountChildren(children, container, parentComponent) {
    children.forEach((child) => {
      patch(null, child, container, parentComponent);
    });
  }

  function processComponent(n1, n2, container, parentComponent) {
    mountComponent(n2, container, parentComponent);
  }

  function mountComponent(initialVNode, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent);

    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
  }

  function setupRenderEffect(instance, initialVNode, container) {
    effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        patch(null, subTree, container, instance);

        initialVNode.el = subTree.el;

        instance.isMounted = true;
      } else {
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const preSubTree = instance.subTree;
        instance.subTree = preSubTree;

        patch(preSubTree, subTree, container, instance);
      }
    });
  }

  return {
    createApp: createAppApi(render),
  };
}

import { Fragment, Text } from "./vnode";
import { ShapeFlags } from "./../utils/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";

export function createRenderer(options) {
  const { createElement, createText, patchProps, insert } = options;

  function render(vnode, container, parentComponent) {
    patch(vnode, container, parentComponent);
  }

  function patch(vnode, container, parentComponent) {
    const { type, shapeFlags } = vnode;

    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent);
        break;
      case Text:
        processText(vnode, container);
        break;
      default:
        if (shapeFlags & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parentComponent);
        } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parentComponent);
        } else {
          const textNode = createText(vnode);
          container.append(textNode);
        }
    }
  }

  function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode.children, container, parentComponent);
  }

  function processText(vnode, container) {
    const textNode = (vnode.el = createText(vnode.children));
    container.append(textNode);
  }

  function processElement(vnode, container, parentComponent) {
    mountElement(vnode, container, parentComponent);
  }

  function mountElement(vnode, container, parentComponent) {
    const { type, props, shapeFlags, children } = vnode;

    const el = (vnode.el = createElement(type));

    if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent);
    } else if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    }

    for (const key in props) {
      const val = props[key];
      patchProps(el, val, key);
    }

    insert(el, container);
  }

  function mountChildren(children, container, parentComponent) {
    children.forEach((child) => {
      patch(child, container, parentComponent);
    });
  }

  function processComponent(vnode, container, parentComponent) {
    mountComponent(vnode, container, parentComponent);
  }

  function mountComponent(initialVNode, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent);

    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
  }

  function setupRenderEffect(instance, initialVNode, container) {
    const proxy = instance.proxy;

    const subTree = instance.render.call(proxy);
    patch(subTree, container, instance);

    initialVNode.el = subTree.el;
  }

  return {
    createApp: createAppApi(render),
  };
}

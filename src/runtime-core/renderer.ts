import { Fragment, Text } from "./vnode";
import { handleEventKey, isOn } from "../utils/index";
import { ShapeFlags } from "./../utils/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container, parentComponent) {
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
        const textNode = document.createTextNode(vnode);
        container.append(textNode);
      }
  }
}

function processFragment(vnode, container, parentComponent) {
  mountChildren(vnode.children, container, parentComponent);
}

function processText(vnode, container) {
  const textNode = (vnode.el = document.createTextNode(vnode.children));
  container.append(textNode);
}

function processElement(vnode, container, parentComponent) {
  mountElement(vnode, container, parentComponent);
}
function mountElement(vnode, container, parentComponent) {
  const { type, props, shapeFlags, children } = vnode;

  const el = (vnode.el = document.createElement(type));

  if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el, parentComponent);
  } else if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  }

  for (const key in props) {
    const val = props[key];

    if (isOn(key)) {
      const event = handleEventKey(key);
      el.addEventListener(event, val);
    } else {
      el.setAttribute(key, val);
    }
  }

  container.append(el);
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
  setupRenderEffect(instance, initialVNode, container, parentComponent);
}

function setupRenderEffect(instance, initialVNode, container, parentComponent) {
  const proxy = instance.proxy;

  const subTree = instance.render.call(proxy);
  patch(subTree, container, instance);

  initialVNode.el = subTree.el;
}

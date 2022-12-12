import { handleEventKey, isOn } from "../utils/index";
import { ShapeFlags } from "./../utils/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  if (vnode.shapeFlags & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if (vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container);
  }
}

function processElement(vnode, container) {
  mountElement(vnode, container);
}
function mountElement(vnode, container) {
  const { type, props, shapeFlags, children } = vnode;

  const el = (vnode.el = document.createElement(type));

  if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el);
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
function mountChildren(children, container) {
  children.forEach((child) => {
    patch(child, container);
  });
}

function processComponent(vnode, container) {
  mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
  const instance = createComponentInstance(initialVNode);

  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance, initialVNode, container) {
  const proxy = instance.proxy;

  const subTree = instance.render.call(proxy);
  patch(subTree, container);

  initialVNode.el = subTree.el;
}

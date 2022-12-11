import { isObject } from "./../utils/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}

function processElement(vnode, container) {
  mountElement(vnode, container);
}
function mountElement(vnode, container) {
  const { type, props, children } = vnode;

  const el = (vnode.el = document.createElement(type));

  if (Array.isArray(children)) {
    mountChildren(children, el);
  } else if (typeof children === "string") {
    el.textContent = children;
  }

  for (const key in props) {
    el.setAttribute(key, props[key]);
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
  setupRenderEffect(instance, vnode, container);
}

function setupRenderEffect(instance, initialVNode, container) {
  const proxy = instance.proxy;
  const subTree = instance.render.call(proxy);
  patch(subTree, container);

  initialVNode.el = subTree.el;
}

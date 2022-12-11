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

  const el = document.createElement(type);

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
function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode);

  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render();
  patch(subTree, container);
}

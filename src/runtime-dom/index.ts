import { handleEventKey, isOn } from "../utils/index";
import { createRenderer } from "../runtime-core";

function createElement(type) {
  return document.createElement(type);
}
function createText(vnode) {
  return document.createTextNode(vnode);
}

function patchProps(el, val, key) {
  if (isOn(key)) {
    const event = handleEventKey(key);
    el.addEventListener(event, val);
  } else {
    el.setAttribute(key, val);
  }
}

function insert(el, container) {
  container.append(el);
}

const renderer: any = createRenderer({
  createElement,
  createText,
  patchProps,
  insert,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from "../runtime-core";

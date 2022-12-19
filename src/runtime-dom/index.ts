import { handleEventKey, isOn } from "../utils/index";
import { createRenderer } from "../runtime-core";

function createElement(type) {
  return document.createElement(type);
}
function createText(vnode) {
  return document.createTextNode(vnode);
}

function setText(el, text) {
  el.textContent = text;
}

function patchProp(el, key, preVal, nexVal) {
  if (isOn(key)) {
    const event = handleEventKey(key);
    el.addEventListener(event, nexVal);
  } else {
    if (nexVal === undefined || nexVal === null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nexVal);
    }
  }
}

function insert(el, container) {
  container.append(el);
}

function remove(child) {
  child.parentNode.removeChild(child);
}

const renderer: any = createRenderer({
  createElement,
  createText,
  setText,
  patchProp,
  insert,
  remove,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from "../runtime-core";

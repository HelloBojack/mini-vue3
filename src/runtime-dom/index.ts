import { handleEventKey, isOn } from "../utils/index";
import { createRenderer } from "../runtime-core";

function createElement(type) {
  return document.createElement(type);
}
function createText(vnode) {
  return document.createTextNode(vnode);
}

function patchProp(el, key, preVal, nexVal) {
  if (isOn(key)) {
    const event = handleEventKey(key);
    el.addEventListener(event, nexVal);
  } else {
    console.log(key);

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

const renderer: any = createRenderer({
  createElement,
  createText,
  patchProp,
  insert,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from "../runtime-core";

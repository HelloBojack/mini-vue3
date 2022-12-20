import { isObject } from "./../utils/index";
import { ShapeFlags } from "../utils/shapeFlags";

export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    key: props?.key,
    props,
    children,
    shapeFlags: getShapeFlag(type),
    component: null,
    el: null,
  };

  if (typeof children === "string") {
    vnode.shapeFlags |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlags |= ShapeFlags.ARRAY_CHILDREN;
  }

  if (vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT && isObject(children)) {
    vnode.shapeFlags |= ShapeFlags.SLOTS_CHILDREN;
  }

  return vnode;
}

function getShapeFlag(type) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}

export function createTextVnode(text) {
  return createVNode(Text, {}, text);
}

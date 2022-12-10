import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from "./baseHandlers";

export enum ReactiveFlag {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

function createActivieObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}

export function reactive(raw) {
  return createActivieObject(raw, mutableHandlers);
}

export function readonly(raw) {
  return createActivieObject(raw, readonlyHandlers);
}

export function shallowReadonly(raw) {
  return createActivieObject(raw, shallowReadonlyHandlers);
}

export function isReactive(value) {
  return !!value[ReactiveFlag.IS_REACTIVE];
}

export function isReadonly(value) {
  return !!value[ReactiveFlag.IS_READONLY];
}

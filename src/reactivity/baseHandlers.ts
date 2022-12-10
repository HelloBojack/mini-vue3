import { isObject } from "../utils";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlag, readonly } from "./reactive";

const get = createGetter();
const set = createSetter();

const readonlyGet = createGetter(true);
const readonlySet = createSetter(true);

function createGetter(isReadonly = false) {
  return function get(target, key, receiver) {
    if (key === ReactiveFlag.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlag.IS_READONLY) {
      return isReadonly;
    }

    const res = Reflect.get(target, key, receiver);

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    if (!isReadonly) {
      track(target, key);
    }

    return res;
  };
}

function createSetter(isReadonly = false) {
  return function set(target, key, newValue, receiver) {
    if (isReadonly) {
      console.warn(`readonly object can't set`);
      return true;
    }
    const res = Reflect.set(target, key, newValue, receiver);
    trigger(target, key);
    return res;
  };
}

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set: readonlySet,
};

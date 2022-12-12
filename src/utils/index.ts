export const extend = Object.assign;

export const isObject = (obj) => obj !== null && typeof obj === "object";

export const hasChanged = (value, newValue) => !Object.is(value, newValue);

export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);

export const isOn = (key: string) => /^on[A-Z]/.test(key);

export const handleEventKey = (key) => key.slice(2).toLowerCase();

export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const camelize = (str) =>
  str.replace(/-(\w)/g, (_, w) => (w ? w.toUpperCase() : ""));

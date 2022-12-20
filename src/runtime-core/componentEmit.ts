import { camelize, capitalize } from "../utils/index";

export function emit(instance, event, ...args) {
  const { props } = instance;

  const toHandlerKey = (str) => (str ? `on${capitalize(camelize(event))}` : "");

  const handlerKey = toHandlerKey(event);

  const handler = props[handlerKey];
  handler && handler(...args);
}

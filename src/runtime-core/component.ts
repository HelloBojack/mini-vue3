import { isObject } from "../utils/index";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
  };

  return component;
}

export function setupComponent(instance) {
  // initProps
  // initSlots

  setupStatefulComponent(instance);
}

export function setupStatefulComponent(instance) {
  const Component = instance.type;

  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);

  const { setup } = Component;

  if (setup) {
    // function -> render fn / object -> context
    const setupResult = setup();

    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult) {
  if (isObject(setupResult)) {
    instance.setupState = setupResult;
  }

  finishSetupComponent(instance);
}

function finishSetupComponent(instance) {
  const Component = instance.type;

  instance.render = Component.render;
}

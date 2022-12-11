import { shallowReadonly } from "../reactivity/reactive";
import { isObject } from "../utils/index";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initProps } from "./componetProps";

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
  };

  return component;
}

export function setupComponent(instance) {
  // initProps
  initProps(instance, instance.vnode.props);
  // initSlots

  setupStatefulComponent(instance);
}

export function setupStatefulComponent(instance) {
  const Component = instance.type;

  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);

  const { setup } = Component;

  if (setup) {
    // function -> render fn / object -> context
    const setupResult = setup(shallowReadonly(instance.props));

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

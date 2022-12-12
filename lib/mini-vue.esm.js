const isObject = (obj) => obj !== null && typeof obj === "object";
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const isOn = (key) => /^on[A-Z]/.test(key);
const handleEventKey = (key) => key.slice(2).toLowerCase();
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const camelize = (str) => str.replace(/-(\w)/g, (_, w) => (w ? w.toUpperCase() : ""));

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOTS_CHILDREN"] = 16] = "SLOTS_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlags: getShapeFlag(type),
        el: null,
    };
    if (typeof children === "string") {
        vnode.shapeFlags |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
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
function createTextVnode(text) {
    return createVNode(Text, {}, text);
}

const targetMap = new Map();
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap)
        return;
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    if (!dep)
        return;
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const readonlySet = createSetter(true);
const shallowReadonlyGet = createGetter(true, true);
const shallowReadonlySet = createSetter(true, true);
function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key, receiver) {
        if (key === ReactiveFlag.IS_REACTIVE) {
            return !isReadonly;
        }
        else if (key === ReactiveFlag.IS_READONLY) {
            return isReadonly;
        }
        const res = Reflect.get(target, key, receiver);
        if (isShallow)
            return res;
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter(isReadonly = false, isShallow = false) {
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
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set: readonlySet,
};
const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set: shallowReadonlySet,
};

var ReactiveFlag;
(function (ReactiveFlag) {
    ReactiveFlag["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlag["IS_READONLY"] = "__v_isReadonly";
})(ReactiveFlag || (ReactiveFlag = {}));
function createActivieObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers);
}
function reactive(raw) {
    return createActivieObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActivieObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActivieObject(raw, shallowReadonlyHandlers);
}

function emit(instance, event, ...args) {
    const { props } = instance;
    const toHandlerKey = (str) => (str ? `on${capitalize(camelize(event))}` : "");
    const handlerKey = toHandlerKey(event);
    console.log(props, handlerKey);
    const handler = props[handlerKey];
    handler && handler(...args);
}

const publicPropertiesMap = {
    $el: (instance) => instance.vnode.el,
    $slots: (instance) => instance.slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

function initSlots(instance, children) {
    if (instance.vnode.shapeFlags & ShapeFlags.SLOTS_CHILDREN) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // initProps
    initProps(instance, instance.vnode.props);
    // initSlots
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        // function -> render fn / object -> context
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
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

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    const { type, shapeFlags } = vnode;
    switch (type) {
        case Fragment:
            processFragment(vnode, container);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (shapeFlags & ShapeFlags.ELEMENT) {
                processElement(vnode, container);
            }
            else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container);
            }
    }
}
function processFragment(vnode, container) {
    mountChildren(vnode.children, container);
}
function processText(vnode, container) {
    const textNode = (vnode.el = document.createTextNode(vnode.children));
    container.append(textNode);
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const { type, props, shapeFlags, children } = vnode;
    const el = (vnode.el = document.createElement(type));
    if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children, el);
    }
    else if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children;
    }
    for (const key in props) {
        const val = props[key];
        if (isOn(key)) {
            const event = handleEventKey(key);
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    container.append(el);
}
function mountChildren(children, container) {
    children.forEach((child) => {
        patch(child, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    const proxy = instance.proxy;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    initialVNode.el = subTree.el;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

export { createApp, createTextVnode, h, renderSlots };

import { extend } from "../utils";

let activeEffect;
let shouldTrack;

class ReactiveEffect {
  private _fn;
  deps = [];
  active = true;
  onStop;
  constructor(fn, public scheduler) {
    this._fn = fn;
  }

  run() {
    if (!this.active) {
      return this._fn();
    }

    activeEffect = this;
    shouldTrack = true;
    const res = this._fn();
    shouldTrack = false;
    return res;
  }

  stop() {
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}
function cleanupEffect(effect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}

export function isTracking() {
  return shouldTrack && activeEffect;
}

const targetMap = new Map();
export function track(target, key) {
  if (!isTracking()) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  trackEffects(dep);
}

export function trackEffects(dep) {
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) return;
  let dep = depsMap.get(key);
  triggerEffects(dep);
}

export function triggerEffects(dep) {
  if (!dep) return;
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options?: any) {
  const scheduler = options?.scheduler;
  const _effect = new ReactiveEffect(fn, scheduler);
  extend(_effect, options);

  _effect.run();

  const effect = _effect.run.bind(_effect);
  effect._effect = _effect;

  return effect;
}

export function stop(fn) {
  fn._effect.stop();
}

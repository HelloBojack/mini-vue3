import { hasChanged, isObject } from "../utils";
import { reactive } from "./reactive";
import { isTracking, trackEffects, triggerEffects } from "./effect";

class RefImpl {
  private _value;
  private _rawValue;
  public dep;
  constructor(value) {
    this._rawValue = value;
    this._value = convert(value);
    this.dep = new Set();
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    if (!hasChanged(this._rawValue, newValue)) return;
    this._rawValue = newValue;
    this._value = convert(newValue);
    triggerEffects(this.dep);
  }
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(raw) {
  return new RefImpl(raw);
}

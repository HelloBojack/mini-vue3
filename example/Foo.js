import {
  h,
  renderSlots,
  createTextVnode,
  getCurrentInstance,
  inject,
  provide,
} from "../lib/mini-vue.esm.js";

const Mid = {
  render() {
    return h(
      "div",
      {},
      "mid:" + this.app_value + "|" + this.foo_value + "|" + this.mid_value
    );
  },
  setup() {
    const app_value = inject("app_value");
    const foo_value = inject("foo_value");
    const mid_value = inject("mid_value", () => "mid_value");
    return {
      app_value,
      foo_value,
      mid_value,
    };
  },
};

export const Foo = {
  render() {
    return h(
      "div",
      {
        id: "foo",
        onClick: this.emitAdd,
      },
      [
        renderSlots(this.$slots, "header", { age: 18 }),
        "app_value:" + this.app_value + "------------",
        "foo_value:" + this.foo_value + "------------",
        createTextVnode("hello"),
        h("div", {}, "foo"),
        renderSlots(this.$slots, "footer"),
        h(Mid),
      ]
    );
  },
  setup(props, { emit }) {
    const instance = getCurrentInstance();
    console.log(instance);
    provide("foo_value", "foo");

    const app_value = inject("app_value");
    const foo_value = inject("foo_value");

    const emitAdd = () => {
      // emit("add", 1, 2, 3);
      emit("add-foo", 1, 2, 3);
    };

    return {
      app_value,
      foo_value,
      emitAdd,
    };
  },
};

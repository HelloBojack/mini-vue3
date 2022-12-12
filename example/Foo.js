import { h, renderSlots } from "../lib/mini-vue.esm.js";

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
        "foo" + this.count,
        h("div", {}, "foo"),
        renderSlots(this.$slots, "footer"),
      ]
    );
  },
  setup(props, { emit }) {
    const emitAdd = () => {
      // emit("add", 1, 2, 3);
      emit("add-foo", 1, 2, 3);
    };

    return {
      emitAdd,
    };
  },
};

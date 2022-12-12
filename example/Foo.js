import { h, renderSlots,createTextVnode } from "../lib/mini-vue.esm.js";

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
        // "foo" + this.count,
        createTextVnode("hello"),
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

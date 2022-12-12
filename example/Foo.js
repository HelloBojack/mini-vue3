import { h } from "../lib/mini-vue.esm.js";

export const Foo = {
  render() {
    return h(
      "div",
      {
        id: "foo",
        onClick: this.emitAdd,
      },
      "foo" + this.count
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

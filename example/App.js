import { h } from "../lib/mini-vue.esm.js";
import { Foo } from "../example/Foo.js";

export const App = {
  render() {
    return h(
      "div",
      {
        id: "div",
        class: ["red"],
        onClick() {
          console.log("click");
        },
      },
      [
        h("p", { id: "p1", class: ["blue"] }, "hi"),
        h("p", { id: "p2", class: ["yellow"] }, "bojack"),
        h("p", { id: "p2", class: ["yellow"] }, this.msg),
        h(Foo, { count: 1 }),
      ]
    );
  },
  setup() {
    return {
      msg: "kkk",
    };
  },
};

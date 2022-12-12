import { h } from "../lib/mini-vue.esm.js";
import { Foo } from "../example/Foo.js";

export const App = {
  render() {
    return h(
      "div",
      {
        id: "div",
        class: ["red"],
      },
      [
        h("p", { id: "p1", class: ["blue"] }, "hi"),
        h("p", { id: "p2", class: ["yellow"] }, "bojack"),
        h("p", { id: "p2", class: ["yellow"] }, this.msg),
        h(
          Foo,
          {
            count: 1,
            onAdd(number1, number2, number3) {
              console.log("on add", number1, number2, number3);
            },
            onAddFoo(number1, number2, number3) {
              console.log("on add-foo", number1, number2, number3);
            },
          },
          {
            header: ({ age }) =>
              h("p", { id: "p1", class: ["yellow"] }, "header" + age),
            footer: () => h("p", { id: "p2", class: ["yellow"] }, "footer"),
          }
        ),
      ]
    );
  },
  setup() {
    return {
      msg: "kkk",
    };
  },
};

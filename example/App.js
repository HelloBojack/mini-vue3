import { h, ref, provide } from "../lib/mini-vue.esm.js";
import { Foo } from "../example/Foo.js";
import { Update } from "../example/Update.js";
import { UpdateElement } from "../example/UpdateElement.js";

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
        h("button", { onClick: this.onClick }, "click me"),
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
        h(Update),
        h(UpdateElement),
      ]
    );
  },
  setup() {
    provide("app_value", "app");
    provide("foo_value", "app_foo");

    const msg = ref("kkk");
    const onClick = () => {
      msg.value = "bojack";
    };

    return {
      msg,
      onClick,
    };
  },
};

import { h } from "../lib/mini-vue.esm.js";

export const App = {
  render() {
    return h("div", { id: "div", class: ["red"] }, [
      h("p", { id: "p1", class: ["blue"] }, "hi"),
      h("p", { id: "p2", class: ["yellow"] }, "bojack"),
    ]);
  },
  setup() {
    return {
      msg: "bojack",
    };
  },
};

import { h } from "../lib/mini-vue.esm.js";

export const App = {
  render() {
    window.self = this;
    return h("div", { id: "div", class: ["red"] }, [
      h("p", { id: "p1", class: ["blue"] }, "hi"),
      h("p", { id: "p2", class: ["yellow"] }, "bojack"),
      h("p", { id: "p2", class: ["yellow"] }, this.msg),
    ]);
  },
  setup() {
    return {
      msg: "kkk",
    };
  },
};

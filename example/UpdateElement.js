import { h, ref } from "../lib/mini-vue.esm.js";

export const UpdateElement = {
  setup() {
    const state = ref(1);
    window.state = state;
    return {
      state,
    };
  },
  render() {
    switch (this.state) {
      case 0:
        return h("div", {}, [
          h("div", {}, "count:0"),
          h("button", {}, "update"),
        ]);
      case 1:
        return h("div", {}, "1");
      case 2:
        return h("div", {}, "22222");
    }
  },
};

import { h, reactive, ref } from "../lib/mini-vue.esm.js";

export const Update = {
  setup() {
    const count = reactive({ value: 0 });
    const click = () => {
      count.value++;
    };
    return {
      count,
      click,
    };
  },
  render() {
    return h("div", {}, [
      h("div", {}, "count:" + this.count.value),
      h(
        "button",
        {
          onClick: this.click,
        },
        "update"
      ),
    ]);
  },
};

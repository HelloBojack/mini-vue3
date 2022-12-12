import { h, ref } from "../lib/mini-vue.esm.js";

export const Update = {
  setup() {
    const count = ref(1);
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
      this.count,
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

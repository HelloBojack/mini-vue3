import { h, reactive, ref } from "../lib/mini-vue.esm.js";

export const Update = {
  setup() {
    const count = ref(0);
    let props = ref({
      id: 1,
      class: "test",
    });
    const click = () => {
      count.value++;
    };
    const click1 = () => {
      props.value.id = 2;
    };
    const click2 = () => {
      props.value.class = undefined;
    };
    const click3 = () => {
      props.value = {
        id: 123,
      };
    };
    return {
      count,
      props,
      click,
      click1,
      click2,
      click3,
    };
  },
  render() {
    return h("div", { ...this.props }, [
      h("div", {}, "count:" + this.count),
      h(
        "button",
        {
          onClick: this.click,
        },
        "update"
      ),
      h(
        "button",
        {
          onClick: this.click1,
        },
        "update-props1"
      ),
      h(
        "button",
        {
          onClick: this.click2,
        },
        "update-props2"
      ),
      h(
        "button",
        {
          onClick: this.click3,
        },
        "update-props3"
      ),
    ]);
  },
};

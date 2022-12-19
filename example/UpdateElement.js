import { h, ref } from "../lib/mini-vue.esm.js";

// 1. 左端对比
// abc
// abed
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
// ];
// 2. 右端对比
// abc
// d ebc
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChildren = [
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// 3. 新长 新增
// 后新增
// ab
// abc
// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
// ];
// 前新增
// ab
// cab
const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
const nextChildren = [
  h("p", { key: "C" }, "C"),
  h("p", { key: "D" }, "D"),
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
];

// 3. 旧长 删除
// 后添加
// abcd
// ab
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
// ];
// const nextChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];

// 前删除
// abc
// bc
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChildren = [h("p", { key: "B" }, "B"), h("p", { key: "C" }, "C")];

export const UpdateElement = {
  setup() {
    const state = ref(3);
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
      case 3:
        return h("div", {}, prevChildren);
      case 4:
        return h("div", {}, nextChildren);
    }
  },
};

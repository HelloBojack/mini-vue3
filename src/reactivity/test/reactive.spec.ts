import { isReactive, reactive } from "../reactive";

describe("reactive", () => {
  it("reactive", () => {
    const user = reactive({
      name: "bojack",
      age: 10,
    });

    expect(user.age).toBe(10);
  });

  it("isReactive", () => {
    const obj = {
      name: "bojack",
      age: 10,
    };
    const user = reactive(obj);

    expect(isReactive(obj)).toBe(false);
    expect(isReactive(user)).toBe(true);
  });
});

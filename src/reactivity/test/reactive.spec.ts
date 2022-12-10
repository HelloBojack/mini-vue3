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

  it("nested reactive", () => {
    const obj = {
      name: "bojack",
      age: 10,
      family: [
        {
          name: "pear",
          age: 20,
        },
      ],
    };
    const user = reactive(obj);

    expect(isReactive(obj)).toBe(false);
    expect(isReactive(user)).toBe(true);
    expect(isReactive(user.family)).toBe(true);
    expect(isReactive(user.family[0])).toBe(true);
  });
});

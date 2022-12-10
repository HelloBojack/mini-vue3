import { isReadonly, readonly } from "../reactive";

describe("reactive", () => {
  it("readonly", () => {
    const user = readonly({
      name: "bojack",
      age: 10,
    });
    console.warn = jest.fn();

    expect(user.age).toBe(10);
    user.age = 11;
    expect(console.warn).toBeCalled();
    expect(user.age).toBe(10);
  });

  it("isReadonly", () => {
    const obj = {
      name: "bojack",
      age: 10,
    };
    const user = readonly(obj);

    expect(isReadonly(obj)).toBe(false);
    expect(isReadonly(user)).toBe(true);
  });
});

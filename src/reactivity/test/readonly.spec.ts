import { isReadonly, readonly } from "../reactive";

describe("readonly test", () => {
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

  it("nested readonly", () => {
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
    const user = readonly(obj);

    expect(isReadonly(user)).toBe(true);
    expect(isReadonly(user.family)).toBe(true);
    expect(isReadonly(user.family[0])).toBe(true);
  });
});

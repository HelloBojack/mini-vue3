import { isReadonly, shallowReadonly } from "../reactive";
describe("shallow test", () => {
  it("shallowReadonly", () => {
    const obj = {
      name: "bojack",
      age: 10,
      family: {
        name: "pear",
        age: 20,
      },
    };
    const user = shallowReadonly(obj);

    expect(isReadonly(user)).toBe(true);
    expect(isReadonly(user.family)).toBe(false);
  });
});

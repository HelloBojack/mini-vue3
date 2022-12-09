import { reactive } from "../reactive";

describe("reactive", () => {
  it("reactive", () => {
    const user = reactive({
      name: "bojack",
      age: 10,
    });

    expect(user.age).toBe(10);
  });
});

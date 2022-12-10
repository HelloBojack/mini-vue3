import { effect } from "../effect";
import { reactive } from "../reactive";
import { computed } from "../computed";

describe("computed", () => {
  it("basic computed", () => {
    const user = reactive({
      name: "bojack",
    });
    const name = computed(() => {
      return user.name;
    });
    expect(name.value).toBe("bojack");
  });

  it("computed", () => {
    const user = reactive({
      name: "bojack",
    });
    const getter = jest.fn(() => {
      return user.name + "k";
    });

    expect(getter).not.toHaveBeenCalled();

    const name = computed(getter);
    expect(name.value).toBe("bojackk");
    expect(getter).toBeCalledTimes(1);

    expect(name.value).toBe("bojackk");
    expect(getter).toBeCalledTimes(1);

    user.name = "hello";
    expect(getter).toBeCalledTimes(1);

    expect(name.value).toBe("hellok");
    expect(getter).toBeCalledTimes(2);
  });
});

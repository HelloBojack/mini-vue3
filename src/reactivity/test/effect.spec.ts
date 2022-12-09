import { effect, stop } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it("basic effect", () => {
    const user = reactive({
      name: "bojack",
      age: 10,
    });

    let nextAge;

    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);

    user.age++;
    expect(nextAge).toBe(12);
  });

  it("effect return", () => {
    const user = reactive({
      name: "bojack",
      age: 10,
    });

    let nextAge;

    let fn = effect(() => {
      nextAge = nextAge ? nextAge + 1 : user.age + 1;
      return "hello";
    });
    expect(nextAge).toBe(11);

    const res = fn();
    expect(nextAge).toBe(12);
    expect(res).toBe("hello");
  });

  it("effect scheduler", () => {
    const user = reactive({
      name: "bojack",
      age: 10,
    });
    let run;
    const scheduler = jest.fn(() => {
      run = fn;
    });
    let nextAge;
    let fn = effect(
      () => {
        nextAge = user.age;
      },
      { scheduler }
    );

    expect(scheduler).not.toHaveBeenCalled();
    expect(nextAge).toBe(10);

    user.age++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(nextAge).toBe(10);
    run();
    expect(nextAge).toBe(11);
  });

  it("effect stop", () => {
    const user = reactive({
      name: "bojack",
      age: 10,
    });

    let nextAge;
    let fn = effect(() => {
      nextAge = user.age;
    });

    expect(nextAge).toBe(10);
    user.age = 11;
    expect(nextAge).toBe(11);
    stop(fn);
    user.age = 12;
    expect(nextAge).toBe(11);
  });

  it("effect onStop", () => {
    const user = reactive({
      name: "bojack",
      age: 10,
    });

    const onStop = jest.fn();

    let nextAge;
    let fn = effect(
      () => {
        nextAge = user.age;
      },
      {
        onStop,
      }
    );
    stop(fn);
    expect(onStop).toBeCalledTimes(1);
  });
});

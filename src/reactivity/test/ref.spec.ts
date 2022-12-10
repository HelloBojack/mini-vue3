import { effect } from "../effect";
import { ref, isRef, unRef } from "../ref";

describe("ref test", () => {
  it("ref", () => {
    const user = ref("bojack");
    expect(user.value).toBe("bojack");
  });

  it("basic effect", () => {
    const count = ref(11);

    let nextCount;
    let call = 0;

    effect(() => {
      call++;
      nextCount = count.value;
    });
    expect(nextCount).toBe(11);
    expect(call).toBe(1);

    count.value = 12;
    expect(nextCount).toBe(12);
    expect(call).toBe(2);

    count.value = 12;
    expect(call).toBe(2);
  });

  it("objectRef", () => {
    const objectRef = ref({ count: 0 });

    expect(objectRef.value.count).toBe(0);

    let nextCount;
    effect(() => {
      nextCount = objectRef.value.count;
    });
    expect(nextCount).toBe(0);
    objectRef.value.count = 2;
    expect(nextCount).toBe(2);
  });

  it("isRef", () => {
    const obj = "bojack";
    const user = ref("bojack");
    expect(isRef(obj)).toBe(false);
    expect(isRef(user)).toBe(true);
  });

  it("isRef", () => {
    const obj = "bojack";
    const user = ref("bojack");
    expect(unRef(user)).toBe("bojack");
    expect(unRef(obj)).toBe("bojack");
  });
});

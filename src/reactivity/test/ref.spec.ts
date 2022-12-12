import { effect } from "../effect";
import { ref, isRef, unRef, proxyRefs } from "../ref";

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

  it("unRef", () => {
    const obj = "bojack";
    const user = ref("bojack");
    expect(unRef(user)).toBe("bojack");
    expect(unRef(obj)).toBe("bojack");
  });

  it("proxyRefs", () => {
    const user = {
      age: ref(10),
      name: "xiaoming",
    };

    // 用在vue3 template 中 setup 返回出去时调用了，在代码里不用 .value 去获取值
    const proxyUser = proxyRefs(user);
    expect(proxyUser.age).toBe(10);
    expect(user.age.value).toBe(10);
    expect(proxyUser.name).toBe("xiaoming");

    // 如果 set 的值是非响应式，就是替换；如果是响应式，就是重新赋值
    proxyUser.age = 20;
    expect(proxyUser.age).toBe(20);
    expect(user.age.value).toBe(20);

    proxyUser.age = ref(10);
    expect(proxyUser.age).toBe(10);
    expect(user.age.value).toBe(10);
  });
});

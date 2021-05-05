import { requestHandled, top100, clear } from "./index";
describe("index", () => {
  beforeEach(() => {
    clear();
  });
  it("tracks single ip addr", () => {
    requestHandled("a");
    expect(top100()).toEqual(["a"]);
  });
  it("tracks 2 ip addr same count", () => {
    requestHandled("a");
    requestHandled("b");
    expect(top100()).toEqual(["a", "b"]);
  });
  it("tracks 1 ip addr multiple count", () => {
    requestHandled("a");
    requestHandled("a");
    expect(top100()).toEqual(["a"]);
  });
  it("tracks 2 ip addr same count, > 1", () => {
    requestHandled("a");
    requestHandled("b");
    requestHandled("a");
    requestHandled("b");
    expect(top100()).toEqual(["a", "b"]);
  });
  it("tracks 2 ip addr, b wins", () => {
    requestHandled("a");
    requestHandled("b");
    requestHandled("a");
    requestHandled("b");
    requestHandled("b");
    expect(top100()).toEqual(["b", "a"]);
  });
  it("various", () => {
    requestHandled("a");
    requestHandled("a");
    requestHandled("a");
    requestHandled("b");
    requestHandled("a");
    requestHandled("c");
    requestHandled("d");
    requestHandled("d");
    requestHandled("d");
    requestHandled("c");
    requestHandled("d");
    requestHandled("d");
    expect(top100()).toEqual(["d", "a", "c", "b"]);
  });
  it.skip("timing", () => {
    console.time("handle1000");
    for (let i = 0; i < 1000; i++) {
      const v = String(Math.floor(Math.random() * 200));
      requestHandled(v);
    }
    console.timeEnd("handle1000");
    console.time("report1000");
    expect(top100().length).toEqual(100);
    console.timeEnd("report1000");

    console.time("handle10000");
    for (let i = 0; i < 10000; i++) {
      const v = String(Math.floor(Math.random() * 2000));
      requestHandled(v);
    }
    console.timeEnd("handle10000");
    console.time("report10000");
    expect(top100().length).toEqual(100);
    console.timeEnd("report10000");

    console.time("handle100000");
    for (let i = 0; i < 100000; i++) {
      const v = String(Math.floor(Math.random() * 20000));
      requestHandled(v);
    }
    console.timeEnd("handle100000");
    console.time("report100000");
    expect(top100().length).toEqual(100);
    console.timeEnd("report100000");

    console.time("handle1000000");
    for (let i = 0; i < 1000000; i++) {
      const v = String(Math.floor(Math.random() * 200000));
      requestHandled(v);
    }
    console.timeEnd("handle1000000");
    console.time("report1000000");
    expect(top100().length).toEqual(100);
    console.timeEnd("report1000000");

    console.time("handle10000000");
    for (let i = 0; i < 10000000; i++) {
      const v = String(Math.floor(Math.random() * 2000000));
      requestHandled(v);
    }
    console.timeEnd("handle10000000");
    console.time("report10000000");
    expect(top100().length).toEqual(100);
    console.timeEnd("report10000000");
  });
});

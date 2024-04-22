import { describe, it, expect } from "@jest/globals";

describe("1) jest 시작테스트", () => {
  it("number가 잘 출력되는지 테스트한다", () => {
    expect(3 + 4).toBe(7); // 3+4가 7인지 테스트
  });

  it("string이 잘 출력되는지 테스트한다", () => {
    const name = "J4J";
    expect(name).toBe("J4J"); // name이 J4J인지 테스트
  });
});

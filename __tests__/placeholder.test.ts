import { describe, it, expect } from "vitest";
import { placeholder } from "../src";

describe("placeholder", () => {
  it("should return ok", () => {
    expect(placeholder()).toBe("ok");
  });
});

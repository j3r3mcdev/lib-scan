import { describe, test, expect } from "vitest";
import { ScanInstance } from "../../core/scan.instance";

describe("ScanInstance", () => {
  test("returns its name", () => {
    const scan = new ScanInstance("lib-scan");
    expect(scan.getName()).toBe("lib-scan");
  });

  test("is always ready", () => {
    const scan = new ScanInstance("test");
    expect(scan.isReady()).toBe(true);
  });
});

import { describe, test, expect } from "vitest";
import { ScanInstance } from "../../../src/core/scan.instance";
import { ScanRegistry } from "../../../src/core/scan.registry";

describe("ScanInstance getName", () => {
  test("returns instance name", () => {
    const registry = new ScanRegistry();
    const scan = new ScanInstance("my-scan", registry);
    expect(scan.getName()).toBe("my-scan");
  });
});

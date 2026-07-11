import { describe, test, expect } from "vitest";
import { ScanInstance } from "../../../src/core/scan.instance";
import { ScanRegistry } from "../../../src/core/scan.registry";

describe("ScanInstance", () => {
  test("runs pipeline and returns result", () => {
    const registry = new ScanRegistry();

    registry.registerDetector({
      id: "d1",
      name: "Detector",
      applies: () => true,
      execute: () => [
        {
          id: "f1",
          vulnerability: "xss",
          severity: "medium",
          score: 30,
          evidence: [],
        },
      ],
    });

    const scan = new ScanInstance("test", registry);
    const result = scan.run();

    expect(result.score).toBe(30);
    expect(result.severity).toBe("medium");
  });
});

import { describe, test, expect } from "vitest";
import { ScanRegistry } from "../../../src/core/scan.registry";
import { ScanError } from "../../../src/core/scan.error";

describe("ScanRegistry", () => {
  test("registers and retrieves detectors", () => {
    const registry = new ScanRegistry();

    const detector = {
      id: "d1",
      name: "Detector",
      applies: () => true,
      execute: () => [],
    };

    registry.registerDetector(detector);

    expect(registry.getDetector("d1")).toBe(detector);
    expect(registry.listDetectors()).toHaveLength(1);
  });

  test("throws when detector has no id", () => {
    const registry = new ScanRegistry();

    expect(() =>
      registry.registerDetector({
        // id manquant
        name: "BadDetector",
        applies: () => true,
        execute: () => [],
      } as any),
    ).toThrow(ScanError);
  });

  test("throws when detector is missing", () => {
    const registry = new ScanRegistry();
    expect(() => registry.getDetector("unknown")).toThrow(ScanError);
  });
});

import { describe, test, expect } from "vitest";
import { ScanPipeline } from "../../../src/core/scan.pipeline";
import { ScanContextImpl } from "../../../src/core/scan.context";

describe("ScanPipeline extra coverage", () => {
  test("skips detector when applies returns false", () => {
    const detectors = [
      {
        id: "skip",
        name: "SkipDetector",
        applies: () => false,
        execute: () => {
          throw new Error("should not be called");
        },
      },
    ];

    const pipeline = new ScanPipeline(detectors);
    const ctx = new ScanContextImpl();
    const result = pipeline.run(ctx);

    expect(result.findings).toHaveLength(0);
  });

  test("handles detector returning empty array", () => {
    const detectors = [
      {
        id: "empty",
        name: "EmptyDetector",
        applies: () => true,
        execute: () => [],
      },
    ];

    const pipeline = new ScanPipeline(detectors);
    const ctx = new ScanContextImpl();
    const result = pipeline.run(ctx);

    expect(result.findings).toHaveLength(0);
  });

  test("handles detector returning undefined", () => {
    const detectors = [
      {
        id: "undef",
        name: "UndefinedDetector",
        applies: () => true,
        execute: () => undefined as any,
      },
    ];

    const pipeline = new ScanPipeline(detectors);
    const ctx = new ScanContextImpl();
    const result = pipeline.run(ctx);

    expect(result.findings).toHaveLength(0);
  });
});

import { describe, test, expect } from "vitest";
import { ScanPipeline } from "../../../src/core/scan.pipeline";
import { ScanError } from "../../../src/core/scan.error";
import { ScanContextImpl } from "../../../src/core/scan.context";

describe("ScanPipeline", () => {
  test("executes detectors and aggregates findings", () => {
    const detectors = [
      {
        id: "d1",
        name: "Detector1",
        applies: () => true,
        execute: () => [
          {
            id: "f1",
            vulnerability: "xss" as const,
            severity: "medium" as const,
            score: 20,
            evidence: [],
          },
        ],
      },
    ];

    const pipeline = new ScanPipeline(detectors);
    const ctx = new ScanContextImpl();

    const result = pipeline.run(ctx);

    expect(result.findings).toHaveLength(1);
    expect(result.score).toBe(20);
    expect(result.severity).toBe("medium");
  });

  test("throws when context is invalid", () => {
    const pipeline = new ScanPipeline([]);
    expect(() => pipeline.run(null as any)).toThrow(ScanError);
  });

  test("throws when detector fails", () => {
    const detectors = [
      {
        id: "bad",
        name: "BadDetector",
        applies: () => true,
        execute: () => {
          throw new Error("boom");
        },
      },
    ];

    const pipeline = new ScanPipeline(detectors);
    const ctx = new ScanContextImpl();

    expect(() => pipeline.run(ctx)).toThrow(ScanError);
  });
});

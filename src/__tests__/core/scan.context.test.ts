import { describe, test, expect } from "vitest";
import { ScanContextImpl } from "../../../src/core/scan.context";

describe("ScanContextImpl", () => {
  test("adds events", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {},
    });

    expect(ctx.events).toHaveLength(1);
  });

  test("adds findings", () => {
    const ctx = new ScanContextImpl();

    ctx.addFinding({
      id: "f1",
      vulnerability: "xss",
      severity: "medium",
      score: 10,
      evidence: [],
    });

    expect(ctx.findings).toHaveLength(1);
  });

  test("sets metadata", () => {
    const ctx = new ScanContextImpl();

    ctx.setMetadata("ua", "Mozilla");
    expect(ctx.metadata.ua).toBe("Mozilla");
  });
});

import { describe, test, expect } from "vitest";
import { ScanResultBuilder } from "../../../src/core/scan.result";
import { ScanContextImpl } from "../../../src/core/scan.context";

describe("ScanResultBuilder severity branches", () => {
  test("low severity", () => {
    const ctx = new ScanContextImpl();
    ctx.addFinding({
      id: "f1",
      vulnerability: "xss",
      severity: "low",
      score: 10,
      evidence: [],
    });
    expect(ScanResultBuilder.build(ctx).severity).toBe("low");
  });

  test("medium severity", () => {
    const ctx = new ScanContextImpl();
    ctx.addFinding({
      id: "f1",
      vulnerability: "xss",
      severity: "medium",
      score: 30,
      evidence: [],
    });
    expect(ScanResultBuilder.build(ctx).severity).toBe("medium");
  });

  test("high severity", () => {
    const ctx = new ScanContextImpl();
    ctx.addFinding({
      id: "f1",
      vulnerability: "xss",
      severity: "medium",
      score: 60,
      evidence: [],
    });
    expect(ScanResultBuilder.build(ctx).severity).toBe("high");
  });

  test("critical severity", () => {
    const ctx = new ScanContextImpl();
    ctx.addFinding({
      id: "f1",
      vulnerability: "xss",
      severity: "critical",
      score: 100,
      evidence: [],
    });
    expect(ScanResultBuilder.build(ctx).severity).toBe("critical");
  });
});

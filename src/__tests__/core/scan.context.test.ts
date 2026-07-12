import { describe, test, expect } from "vitest";
import { ScanContextImpl } from "../../../src/core/scan.context";

describe("ScanContextImpl full coverage", () => {
  test("initializes empty arrays and metadata", () => {
    const ctx = new ScanContextImpl();

    expect(ctx.events).toEqual([]);
    expect(ctx.findings).toEqual([]);
    expect(ctx.chains).toEqual([]);
    expect(ctx.metadata).toEqual({});
  });

  test("addEvent pushes an event", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {},
    });

    expect(ctx.events.length).toBe(1);
    expect(ctx.events[0].id).toBe("e1");
  });

  test("addFinding pushes a finding", () => {
    const ctx = new ScanContextImpl();

    ctx.addFinding({
      id: "f1",
      vulnerability: "xss",
      severity: "medium",
      score: 10,
      evidence: [],
    });

    expect(ctx.findings.length).toBe(1);
    expect(ctx.findings[0].id).toBe("f1");
  });

  test("setMetadata sets a new key", () => {
    const ctx = new ScanContextImpl();

    ctx.setMetadata("ua", "Mozilla");
    expect(ctx.metadata.ua).toBe("Mozilla");
  });

  test("setMetadata overwrites an existing key", () => {
    const ctx = new ScanContextImpl();

    ctx.setMetadata("ua", "Mozilla");
    ctx.setMetadata("ua", "Chrome");

    expect(ctx.metadata.ua).toBe("Chrome");
  });
});

import { describe, test, expect } from "vitest";
import { ScanContextImpl } from "../../../src/core/scan.context";

describe("ScanContextImpl extra coverage", () => {
  test("initializes empty arrays", () => {
    const ctx = new ScanContextImpl();

    expect(ctx.events).toEqual([]);
    expect(ctx.findings).toEqual([]);
    expect(ctx.chains).toEqual([]);
    expect(ctx.metadata).toEqual({});
  });

  test("addEvent modifies events array", () => {
    const ctx = new ScanContextImpl();

    expect(ctx.events).toHaveLength(0); // ← couvre la ligne 10

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {},
    });

    expect(ctx.events).toHaveLength(1); // ← couvre la ligne 18
  });
});

import { describe, test, expect } from "vitest";
import { ScanResultBuilder } from "../../../src/core/scan.result";
import { ScanContextImpl } from "../../../src/core/scan.context";

describe("ScanResultBuilder", () => {
  test("computes score and severity", () => {
    const ctx = new ScanContextImpl();

    ctx.addFinding({
      id: "f1",
      vulnerability: "xss" as const,
      severity: "medium" as const,
      score: 50,
      evidence: [],
    });

    const result = ScanResultBuilder.build(ctx);

    expect(result.score).toBe(50);
    expect(result.severity).toBe("high");
  });

  test("includes metadata and chains", () => {
    const ctx = new ScanContextImpl();

    ctx.setMetadata("ip", "127.0.0.1");

    const chains = ctx.chains as Array<{
      id: string;
      type: "xss";
      events: never[];
      confidence: number;
    }>;

    chains.push({
      id: "c1",
      type: "xss" as const,
      events: [],
      confidence: 0.9,
    });

    const result = ScanResultBuilder.build(ctx);

    expect(result.metadata?.ip).toBe("127.0.0.1");
    expect(result.chains).toHaveLength(1);
  });
});

import { describe, test, expect } from "vitest";
import { LFIDetector } from "../../../src/detectors/lfi/lfi.detector";
import { LFI_PATTERNS } from "../../../src/detectors/lfi/lfi.patterns";
import { ScanContextImpl } from "../../../src/core/scan.context";

describe("LFIDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(LFI_PATTERNS)).toBe(true);
    expect(LFI_PATTERNS.length).toBeGreaterThan(0);
    expect(LFI_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new LFIDetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns false when events array is empty", () => {
    const ctx = new ScanContextImpl();
    const det = new LFIDetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns true when http event exists", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new LFIDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects LFI in payload", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "../../etc/passwd",
      metadata: {},
    });

    const det = new LFIDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.evidence[0].pattern.includes("etc"))).toBe(
      true,
    );
  });

  test("detects LFI in metadata", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        query: { file: "../etc/shadow" },
        path: "/view?file=../../proc/self/environ",
        headers: { "x-custom": "php://input" },
        body: { p: "file:///etc/passwd" },
      },
    });

    const det = new LFIDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no LFI patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "safe content",
      metadata: {},
    });

    const det = new LFIDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

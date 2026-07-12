import { describe, test, expect } from "vitest";
import { PathTraversalDetector } from "../../../src/detectors/path/path.detector";
import { PATH_PATTERNS } from "../../../src/detectors/path/path.patterns";
import { ScanContextImpl } from "../../../src/core/scan.context";

describe("PathTraversalDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(PATH_PATTERNS)).toBe(true);
    expect(PATH_PATTERNS.length).toBeGreaterThan(0);
    expect(PATH_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new PathTraversalDetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns false when events array is empty", () => {
    const ctx = new ScanContextImpl();
    const det = new PathTraversalDetector();
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

    const det = new PathTraversalDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects path traversal in payload", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "../etc/passwd",
      metadata: {},
    });

    const det = new PathTraversalDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.evidence[0].pattern.includes("etc"))).toBe(
      true,
    );
  });

  test("detects path traversal in metadata", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        query: { file: "../secret.txt" },
        path: "/download?path=../../root",
        headers: { "x-custom": "file:///etc/passwd" },
        body: { p: "c:\\windows\\system32" },
      },
    });

    const det = new PathTraversalDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no path traversal patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "safe content",
      metadata: {},
    });

    const det = new PathTraversalDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

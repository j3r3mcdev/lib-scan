import { describe, test, expect } from "vitest";
import { HeaderDetector } from "../../../src/detectors/headers/header.detector";
import { HEADER_PATTERNS } from "../../../src/detectors/headers/header.patterns";
import { ScanContextImpl } from "../../../src/core/scan.context";

describe("HeaderDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(HEADER_PATTERNS)).toBe(true);
    expect(HEADER_PATTERNS.length).toBeGreaterThan(0);
    expect(HEADER_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new HeaderDetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns false when events array is empty", () => {
    const ctx = new ScanContextImpl();
    const det = new HeaderDetector();
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

    const det = new HeaderDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects attacks in headers", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        headers: {
          "x-forwarded-for": "../../etc/passwd",
          cookie: "UNION SELECT * FROM users",
          referer: "<script>alert(1)</script>",
        },
      },
    });

    const det = new HeaderDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no header patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        headers: {
          "x-forwarded-for": "127.0.0.1",
          cookie: "session=abc",
        },
      },
    });

    const det = new HeaderDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });

  test("returns empty array when headers are missing", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {}, // ✔ headers absent
    });

    const det = new HeaderDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

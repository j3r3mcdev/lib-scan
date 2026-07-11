import { describe, test, expect } from "vitest";
import { XSSDetector } from "../../../src/detectors/xss/xss.detector";
import { XSS_PATTERNS } from "../../../src/detectors/xss/xss.patterns";
import { ScanContextImpl } from "../../../src/core/scan.context";

describe("XSSDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(XSS_PATTERNS)).toBe(true);
    expect(XSS_PATTERNS.length).toBeGreaterThan(0);
    expect(XSS_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new XSSDetector();
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

    const det = new XSSDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects XSS in payload", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "<script>alert(1)</script>",
      metadata: {},
    });

    const det = new XSSDetector();
    const findings = det.execute(ctx);

    // Option B: 1 finding per pattern
    expect(findings.length).toBeGreaterThan(0);

    // At least one finding must match the <script> pattern
    expect(findings.some((f) => f.evidence[0].pattern.includes("script"))).toBe(
      true,
    );
  });

  test("detects XSS in metadata", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        query: { q: "javascript:alert(1)" },
        path: "/search?<script>",
        headers: { "x-custom": "onerror=alert(1)" },
        body: { msg: "<img src=x onload=alert(1)>" },
      },
    });

    const det = new XSSDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no XSS patterns found", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "safe content",
      metadata: {},
    });

    const det = new XSSDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });

  test("applies() returns false when events array is empty", () => {
    const ctx = new ScanContextImpl(); // events = []

    const det = new XSSDetector();
    expect(det.applies(ctx)).toBe(false);
  });
});

import { describe, test, expect } from "vitest";
import { UADetector } from "../../../detectors/http/ua/ua.detector";
import { UA_PATTERNS } from "../../../detectors/http/ua/ua.patterns";
import { ScanContextImpl } from "../../../core/scan.context";

describe("UADetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(UA_PATTERNS)).toBe(true);
    expect(UA_PATTERNS.length).toBeGreaterThan(0);
    expect(UA_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new UADetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns false when events array is empty", () => {
    const ctx = new ScanContextImpl();
    const det = new UADetector();
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

    const det = new UADetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects suspicious User-Agent", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        headers: {
          "user-agent": "sqlmap/1.7.2",
        },
      },
    });

    const det = new UADetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when UA is safe", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        headers: {
          "user-agent": "Mozilla/5.0",
        },
      },
    });

    const det = new UADetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });

  test("returns empty array when headers are missing", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {}, // no headers
    });

    const det = new UADetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

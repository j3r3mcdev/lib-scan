import { describe, test, expect } from "vitest";
import { SQLIDetector } from "../../../src/detectors/sqli/sqli.detector";
import { SQLI_PATTERNS } from "../../../src/detectors/sqli/sqli.patterns";
import { ScanContextImpl } from "../../../src/core/scan.context";

describe("SQLIDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(SQLI_PATTERNS)).toBe(true);
    expect(SQLI_PATTERNS.length).toBeGreaterThan(0);
    expect(SQLI_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new SQLIDetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns false when events array is empty", () => {
    const ctx = new ScanContextImpl();
    const det = new SQLIDetector();
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

    const det = new SQLIDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects SQLi in payload", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "1 OR 1=1",
      metadata: {},
    });

    const det = new SQLIDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.evidence[0].pattern.includes("or"))).toBe(
      true,
    );
  });

  test("detects SQLi in metadata", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        query: { id: "1 OR 1=1" },
        path: "/users?name=' OR 'a'='a",
        headers: { "x-custom": "UNION SELECT * FROM users" },
        body: { q: "DROP TABLE accounts" },
      },
    });

    const det = new SQLIDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no SQLi patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "safe content",
      metadata: {},
    });

    const det = new SQLIDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

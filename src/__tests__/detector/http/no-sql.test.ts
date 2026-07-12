import { describe, test, expect } from "vitest";
import { NoSQLInjectionDetector } from "../../../detectors/http/no-sql/no-sql.detector";
import { NOSQL_PATTERNS } from "../../../../src/detectors/http/no-sql/no-sql.patterns";
import { ScanContextImpl } from "../../../../src/core/scan.context";

describe("NoSQLInjectionDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(NOSQL_PATTERNS)).toBe(true);
    expect(NOSQL_PATTERNS.length).toBeGreaterThan(0);
    expect(NOSQL_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new NoSQLInjectionDetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns false when events array is empty", () => {
    const ctx = new ScanContextImpl();
    const det = new NoSQLInjectionDetector();
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

    const det = new NoSQLInjectionDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects NoSQL injection payloads", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: '{"username": {"$ne": null}}',
      metadata: {},
    });

    const det = new NoSQLInjectionDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("detects NoSQL injection in metadata", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        query: { filter: '{"$or":[{"role":"admin"},{"$ne":null}]}' },
        path: "/search?filter=%24or",
        headers: { "x-filter": '%24regex:"admin"' },
        body: { data: '{"$gt": ""}' },
      },
    });

    const det = new NoSQLInjectionDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no NoSQL patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "safe content",
      metadata: {},
    });

    const det = new NoSQLInjectionDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });

  test("returns empty array when metadata headers/query/body missing", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new NoSQLInjectionDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

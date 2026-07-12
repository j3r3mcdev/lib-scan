import { describe, test, expect } from "vitest";
import { SSTIDetector } from "../../../../src/detectors/http/ssti/ssti.detector";
import { SSTI_PATTERNS } from "../../../../src/detectors/http/ssti/ssti.patterns";
import { ScanContextImpl } from "../../../../src/core/scan.context";

describe("SSTIDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(SSTI_PATTERNS)).toBe(true);
    expect(SSTI_PATTERNS.length).toBeGreaterThan(0);
    expect(SSTI_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new SSTIDetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns false when events array is empty", () => {
    const ctx = new ScanContextImpl();
    const det = new SSTIDetector();
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

    const det = new SSTIDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects SSTI payloads", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "{{7*7}}",
      metadata: {},
    });

    const det = new SSTIDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("detects SSTI in metadata", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        query: { q: "${7*7}" },
        path: "/page?tpl=%7B%7B7*7%7D%7D",
        headers: { referer: "<%=7*7%>" },
        body: { data: "{% block %}" },
      },
    });

    const det = new SSTIDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no SSTI patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "safe content",
      metadata: {},
    });

    const det = new SSTIDetector();
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

    const det = new SSTIDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

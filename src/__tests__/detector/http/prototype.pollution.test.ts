import { describe, test, expect } from "vitest";
import { PrototypePollutionDetector } from "../../../../src/detectors/http/prototype-pollution/prototype-pollution.detectors";
import { PROTOTYPE_POLLUTION_PATTERNS } from "../../../../src/detectors/http/prototype-pollution/prototype-pollution.patterns";
import { ScanContextImpl } from "../../../../src/core/scan.context";

describe("PrototypePollutionDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(PROTOTYPE_POLLUTION_PATTERNS)).toBe(true);
    expect(PROTOTYPE_POLLUTION_PATTERNS.length).toBeGreaterThan(0);
    expect(PROTOTYPE_POLLUTION_PATTERNS.every((p) => p instanceof RegExp)).toBe(
      true,
    );
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new PrototypePollutionDetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns false when events array is empty", () => {
    const ctx = new ScanContextImpl();
    const det = new PrototypePollutionDetector();
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

    const det = new PrototypePollutionDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects prototype pollution payloads", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: '{"__proto__": {"polluted": true}}',
      metadata: {},
    });

    const det = new PrototypePollutionDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("detects prototype pollution in metadata", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        query: { __proto__: "polluted" },
        path: "/update?constructor=evil",
        headers: { referer: "%5F%5Fproto%5F%5F" },
        body: { data: '{"prototype": {"x": 1}}' },
      },
    });

    const det = new PrototypePollutionDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no prototype pollution patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "safe content",
      metadata: {},
    });

    const det = new PrototypePollutionDetector();
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

    const det = new PrototypePollutionDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

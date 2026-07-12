import { describe, test, expect } from "vitest";
import { AnomalyDetector } from "../../../../src/detectors/http/anomaly/anomaly.detector";
import { ANOMALY_PATTERNS } from "../../../../src/detectors/http/anomaly/anomaly.patterns";
import { ScanContextImpl } from "../../../../src/core/scan.context";

describe("AnomalyDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(ANOMALY_PATTERNS)).toBe(true);
    expect(ANOMALY_PATTERNS.length).toBeGreaterThan(0);
    expect(ANOMALY_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new AnomalyDetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns false when events array is empty", () => {
    const ctx = new ScanContextImpl();
    const det = new AnomalyDetector();
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

    const det = new AnomalyDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects anomalies in payload", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "A".repeat(6000), // long payload anomaly
      metadata: {},
    });

    const det = new AnomalyDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("detects anomalies in metadata", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        query: { fuzz: "B".repeat(3000) },
        path: "/test/%C0%AF",
        headers: { referer: "\u202Eevil" },
        body: { data: "AAAAA".repeat(200) },
      },
    });

    const det = new AnomalyDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no anomaly patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "normal content",
      metadata: {},
    });

    const det = new AnomalyDetector();
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

    const det = new AnomalyDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

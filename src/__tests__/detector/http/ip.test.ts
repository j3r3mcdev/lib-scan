import { describe, test, expect } from "vitest";
import { IPDetector } from "../../../detectors/http/ip/ip.detector";
import { IP_PATTERNS } from "../../../../src/detectors/http/ip/ip.patterns";
import { ScanContextImpl } from "../../../../src/core/scan.context";

describe("IPDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(IP_PATTERNS)).toBe(true);
    expect(IP_PATTERNS.length).toBeGreaterThan(0);
    expect(IP_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new IPDetector();
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

    const det = new IPDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects IP in payload", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "connecting to 192.168.0.10",
      metadata: {},
    });

    const det = new IPDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("detects IP in metadata (ip, path, headers, body)", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        ip: "10.0.0.1",
        path: "/proxy/127.0.0.1",
        headers: { referer: "http://localhost" },
        body: { target: "127%2E0%2E0%2E1" },
      },
    });

    const det = new IPDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no IP patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "no ip here",
      metadata: {},
    });

    const det = new IPDetector();
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

    const det = new IPDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

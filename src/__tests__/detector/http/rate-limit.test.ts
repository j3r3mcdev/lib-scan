import { describe, test, expect } from "vitest";
import { RateLimitDetector } from "../../../../src/detectors/http/rate-limit/rate-limit.detector";
import { RATELIMIT_PATTERNS } from "../../../../src/detectors/http/rate-limit/rate-limit.patterns";
import { ScanContextImpl } from "../../../../src/core/scan.context";

describe("RateLimitDetector", () => {
  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new RateLimitDetector();
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

    const det = new RateLimitDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects too many requests per minute", () => {
    const ctx = new ScanContextImpl();
    const now = Date.now();

    for (let i = 0; i < RATELIMIT_PATTERNS.maxRequestsPerMinute + 5; i++) {
      ctx.addEvent({
        id: `e${i}`,
        source: "http",
        timestamp: now,
        metadata: { ip: "1.2.3.4", path: "/login" },
      });
    }

    const det = new RateLimitDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("detects burst requests in 10 seconds", () => {
    const ctx = new ScanContextImpl();
    const now = Date.now();

    for (let i = 0; i < RATELIMIT_PATTERNS.maxRequestsPer10Seconds + 3; i++) {
      ctx.addEvent({
        id: `b${i}`,
        source: "http",
        timestamp: now,
        metadata: { ip: "9.9.9.9", path: "/api" },
      });
    }

    const det = new RateLimitDetector();
    const findings = det.execute(ctx);

    expect(
      findings.some((f) => f.evidence[0].pattern === "requests_per_10_seconds"),
    ).toBe(true);
  });

  test("detects too many requests from same IP", () => {
    const ctx = new ScanContextImpl();
    const now = Date.now();

    for (let i = 0; i < RATELIMIT_PATTERNS.maxRequestsPerIP + 10; i++) {
      ctx.addEvent({
        id: `ip${i}`,
        source: "http",
        timestamp: now,
        metadata: { ip: "7.7.7.7", path: "/home" },
      });
    }

    const det = new RateLimitDetector();
    const findings = det.execute(ctx);

    expect(
      findings.some((f) => f.evidence[0].pattern === "requests_per_ip"),
    ).toBe(true);
  });

  test("detects too many requests on same path", () => {
    const ctx = new ScanContextImpl();
    const now = Date.now();

    for (
      let i = 0;
      i < RATELIMIT_PATTERNS.maxRequestsPerPathPerMinute + 5;
      i++
    ) {
      ctx.addEvent({
        id: `p${i}`,
        source: "http",
        timestamp: now,
        metadata: { ip: "4.4.4.4", path: "/auth" },
      });
    }

    const det = new RateLimitDetector();
    const findings = det.execute(ctx);

    expect(
      findings.some((f) => f.evidence[0].pattern === "requests_per_path"),
    ).toBe(true);
  });

  test("returns empty array when thresholds are not exceeded", () => {
    const ctx = new ScanContextImpl();
    const now = Date.now();

    for (let i = 0; i < 10; i++) {
      ctx.addEvent({
        id: `ok${i}`,
        source: "http",
        timestamp: now,
        metadata: { ip: "1.1.1.1", path: "/safe" },
      });
    }

    const det = new RateLimitDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

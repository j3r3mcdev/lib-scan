import { describe, test, expect } from "vitest";
import { DNSDetector } from "../../../../src/detectors/http/dns/dns.detector";
import { DNS_PATTERNS } from "../../../../src/detectors/http/dns/dns.patterns";
import { ScanContextImpl } from "../../../../src/core/scan.context";

describe("DNSDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(DNS_PATTERNS)).toBe(true);
    expect(DNS_PATTERNS.length).toBeGreaterThan(0);
    expect(DNS_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new DNSDetector();
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

    const det = new DNSDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects DNS rebinding payloads", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "http://evil.onion",
      metadata: {},
    });

    const det = new DNSDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("detects DNS anomalies in metadata", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        query: { host: "subdomain." + "A".repeat(50) + ".com" },
        path: "/resolve/duckdns.org",
        headers: { referer: "http://127.0.0.1" },
        body: { domain: "%2Eonion" },
      },
    });

    const det = new DNSDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no DNS patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "normal-domain.com",
      metadata: {},
    });

    const det = new DNSDetector();
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

    const det = new DNSDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

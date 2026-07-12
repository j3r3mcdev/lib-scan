import { describe, test, expect } from "vitest";
import { CRLFDetector } from "../../../../src/detectors/http/crlf/crlf.detector";
import { CRLF_PATTERNS } from "../../../../src/detectors/http/crlf/crlf.patterns";
import { ScanContextImpl } from "../../../../src/core/scan.context";

describe("CRLFDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(CRLF_PATTERNS)).toBe(true);
    expect(CRLF_PATTERNS.length).toBeGreaterThan(0);
    expect(CRLF_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new CRLFDetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns false when events array is empty", () => {
    const ctx = new ScanContextImpl();
    const det = new CRLFDetector();
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

    const det = new CRLFDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects CRLF injection payloads", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "Hello\r\nSet-Cookie: session=evil",
      metadata: {},
    });

    const det = new CRLFDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("detects CRLF in metadata", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        query: { q: "%0d%0aLocation: https://evil.com" },
        path: "/index%0d%0aSet-Cookie: hacked=true",
        headers: { referer: "test\r\nX-Test: injected" },
        body: { data: "%0a%0dInjected" },
      },
    });

    const det = new CRLFDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no CRLF patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "safe content",
      metadata: {},
    });

    const det = new CRLFDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });

  test("returns empty array when metadata headers/query/body missing", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {}, // no headers/query/body
    });

    const det = new CRLFDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

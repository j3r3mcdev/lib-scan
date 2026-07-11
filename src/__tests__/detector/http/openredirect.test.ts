import { describe, test, expect } from "vitest";
import { OpenRedirectDetector } from "../../../../src/detectors/http/openredirect/openredirect.detector";
import { OPEN_REDIRECT_PATTERNS } from "../../../../src/detectors/http/openredirect/openredirect.patterns";
import { ScanContextImpl } from "../../../../src/core/scan.context";

describe("OpenRedirectDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(OPEN_REDIRECT_PATTERNS)).toBe(true);
    expect(OPEN_REDIRECT_PATTERNS.length).toBeGreaterThan(0);
    expect(OPEN_REDIRECT_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new OpenRedirectDetector();
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

    const det = new OpenRedirectDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects open redirect in payload", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "https://evil.com",
      metadata: {},
    });

    const det = new OpenRedirectDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("detects open redirect in metadata", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        query: { redirect: "https://evil.com" },
        path: "/login?next=//evil.com",
        headers: { referer: "javascript:alert(1)" },
        body: { url: "%2f%2fmalicious.com" },
      },
    });

    const det = new OpenRedirectDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no open redirect patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "safe content",
      metadata: {},
    });

    const det = new OpenRedirectDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

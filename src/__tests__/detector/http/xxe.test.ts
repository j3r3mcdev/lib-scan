import { describe, test, expect } from "vitest";
import { XXEDetector } from "../../../../src/detectors/http/xxe/xxe.detector";
import { XXE_PATTERNS } from "../../../../src/detectors/http/xxe/xxe.patterns";
import { ScanContextImpl } from "../../../../src/core/scan.context";

describe("XXEDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(XXE_PATTERNS)).toBe(true);
    expect(XXE_PATTERNS.length).toBeGreaterThan(0);
    expect(XXE_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new XXEDetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns false when events array is empty", () => {
    const ctx = new ScanContextImpl();
    const det = new XXEDetector();
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

    const det = new XXEDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects XXE payloads", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: '<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>',
      metadata: {},
    });

    const det = new XXEDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("detects XXE in metadata", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        query: { xml: "%3C!DOCTYPE%20foo%3E" },
        path: "/upload?xml=%3C!ENTITY",
        headers: { referer: '<!ENTITY lol SYSTEM "file:///etc/passwd">' },
        body: { data: "<!ENTITY lol1 SYSTEM 'file:///etc/passwd'>" },
      },
    });

    const det = new XXEDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no XXE patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "safe content",
      metadata: {},
    });

    const det = new XXEDetector();
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

    const det = new XXEDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

import { describe, test, expect } from "vitest";
import { RFIDetector } from "../../../../../src/detectors/http/rfi/rfi.detector";
import { RFI_PATTERNS } from "../../../../../src/detectors/http/rfi/rfi.patterns";
import { ScanContextImpl } from "../../../../../src/core/scan.context";

describe("RFIDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(RFI_PATTERNS)).toBe(true);
    expect(RFI_PATTERNS.length).toBeGreaterThan(0);
    expect(RFI_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new RFIDetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns false when events array is empty", () => {
    const ctx = new ScanContextImpl();
    const det = new RFIDetector();
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

    const det = new RFIDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects RFI payloads", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "http://evil.com/shell.txt",
      metadata: {},
    });

    const det = new RFIDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("detects RFI in metadata", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        query: { file: "https://malicious.com/backdoor.php" },
        path: "/index.php?include=//evil.com",
        headers: { referer: "ftp://badhost.com/file.txt" },
        body: { data: "%3a%2f%2fremote.com" },
      },
    });

    const det = new RFIDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no RFI patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "safe content",
      metadata: {},
    });

    const det = new RFIDetector();
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

    const det = new RFIDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

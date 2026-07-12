import { describe, test, expect } from "vitest";
import { MIMEDetector } from "../../../../src/detectors/http/mime/mime.detector";
import { MIME_PATTERNS } from "../../../../src/detectors/http/mime/mime.patterns";
import { ScanContextImpl } from "../../../../src/core/scan.context";

describe("MIMEDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(MIME_PATTERNS)).toBe(true);
    expect(MIME_PATTERNS.length).toBeGreaterThan(0);
    expect(MIME_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new MIMEDetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns false when events array is empty", () => {
    const ctx = new ScanContextImpl();
    const det = new MIMEDetector();
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

    const det = new MIMEDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects MIME injection payloads", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "Content-Type: application/x-php",
      metadata: {},
    });

    const det = new MIMEDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("detects MIME injection in metadata", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        query: { type: "text/html" },
        path: "/upload.php",
        headers: { "content-type": "image/svg+xml" },
        body: { data: "application%2Fx-php" },
      },
    });

    const det = new MIMEDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no MIME patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "safe content",
      metadata: {},
    });

    const det = new MIMEDetector();
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

    const det = new MIMEDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

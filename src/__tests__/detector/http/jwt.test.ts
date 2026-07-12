import { describe, test, expect } from "vitest";
import { JWTDetector } from "../../../../src/detectors/http/jwt/jwt.detector";
import { JWT_PATTERNS } from "../../../../src/detectors/http/jwt/jwt.patterns";
import { ScanContextImpl } from "../../../../src/core/scan.context";

describe("JWTDetector", () => {
  test("patterns file exports an array of regex", () => {
    expect(Array.isArray(JWT_PATTERNS)).toBe(true);
    expect(JWT_PATTERNS.length).toBeGreaterThan(0);
    expect(JWT_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  test("applies() returns false when no http events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "dns",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new JWTDetector();
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

    const det = new JWTDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects alg:none attack", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: '{"alg":"none"}',
      metadata: {},
    });

    const det = new JWTDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("detects JWT issues in metadata", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {
        query: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        path: "/auth/kid=../../etc/passwd",
        headers: { authorization: "Bearer eyJhbGciOiJub25lIn0..." },
        body: { jwt: "-----BEGIN PUBLIC KEY-----" },
      },
    });

    const det = new JWTDetector();
    const findings = det.execute(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });

  test("returns empty array when no patterns match", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      payload: "safe content",
      metadata: {},
    });

    const det = new JWTDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });

  test("returns empty array when metadata missing", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new JWTDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

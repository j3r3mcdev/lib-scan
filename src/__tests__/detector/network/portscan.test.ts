import { describe, test, expect } from "vitest";
import { PortScanDetector } from "../../../detectors/network/portscan/portscan.detector";
import { PORTSCAN_PATTERNS } from "../../../detectors/network/portscan/portscan.patterns";
import { ScanContextImpl } from "../../../core/scan.context";

describe("PortScanDetector", () => {
  test("applies() returns false when no network events exist", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "http",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new PortScanDetector();
    expect(det.applies(ctx)).toBe(false);
  });

  test("applies() returns true when network event exists", () => {
    const ctx = new ScanContextImpl();
    ctx.addEvent({
      id: "e1",
      source: "scan",
      timestamp: Date.now(),
      metadata: {},
    });

    const det = new PortScanDetector();
    expect(det.applies(ctx)).toBe(true);
  });

  test("detects burst scanning", () => {
    const ctx = new ScanContextImpl();
    const now = Date.now();

    for (let i = 0; i < PORTSCAN_PATTERNS.maxEventsPer10Seconds + 5; i++) {
      ctx.addEvent({
        id: `b${i}`,
        source: "scan",
        timestamp: now,
        metadata: { ip: "1.2.3.4", port: i },
      });
    }

    const det = new PortScanDetector();
    const findings = det.execute(ctx);

    expect(findings.some((f) => f.evidence[0].pattern === "burst")).toBe(true);
  });

  test("detects vertical scan (many ports on same IP)", () => {
    const ctx = new ScanContextImpl();
    const now = Date.now();

    for (let p = 1; p <= PORTSCAN_PATTERNS.maxPortsPerIP + 10; p++) {
      ctx.addEvent({
        id: `v${p}`,
        source: "scan",
        timestamp: now,
        metadata: { ip: "9.9.9.9", port: p },
      });
    }

    const det = new PortScanDetector();
    const findings = det.execute(ctx);

    expect(
      findings.some((f) => f.evidence[0].pattern === "vertical_scan"),
    ).toBe(true);
  });

  test("detects horizontal scan (many IPs on same port)", () => {
    const ctx = new ScanContextImpl();
    const now = Date.now();

    for (let i = 0; i < PORTSCAN_PATTERNS.maxIPsPerPort + 5; i++) {
      ctx.addEvent({
        id: `h${i}`,
        source: "scan",
        timestamp: now,
        metadata: { ip: `10.0.0.${i}`, port: 22 },
      });
    }

    const det = new PortScanDetector();
    const findings = det.execute(ctx);

    expect(
      findings.some((f) => f.evidence[0].pattern === "horizontal_scan"),
    ).toBe(true);
  });

  test("returns empty array when no portscan patterns found", () => {
    const ctx = new ScanContextImpl();
    const now = Date.now();

    for (let i = 0; i < 5; i++) {
      ctx.addEvent({
        id: `ok${i}`,
        source: "scan",
        timestamp: now,
        metadata: { ip: "1.1.1.1", port: i },
      });
    }

    const det = new PortScanDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });

  test("returns empty array when no scan events exist", () => {
    const ctx = new ScanContextImpl();

    // Aucun event ajouté → events.length === 0
    const det = new PortScanDetector();
    const findings = det.execute(ctx);

    expect(findings).toHaveLength(0);
  });
});

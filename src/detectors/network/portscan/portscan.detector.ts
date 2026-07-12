import { PORTSCAN_PATTERNS } from "./portscan.patterns";
import {
  ScanDetector,
  ScanContext,
  ScanFinding,
} from "../../../core/scan.types";

export class PortScanDetector implements ScanDetector {
  readonly id = "portscan-detector";
  readonly name = "Port Scan Detector";

  applies(context: ScanContext): boolean {
    return context.events.some((e) => e.source === "scan");
  }

  execute(context: ScanContext): ScanFinding[] {
    const findings: ScanFinding[] = [];
    const events = context.events.filter((e) => e.source === "scan");

    if (events.length === 0) return findings;

    const now = Date.now();
    const last10s = now - 10_000;

    const portsByIP = new Map<string, Set<number>>();
    const ipsByPort = new Map<number, Set<string>>();

    let burstCount = 0;

    for (const event of events) {
      const meta = event.metadata || {};
      const ip = meta.ip || "unknown";
      const port = Number(meta.port || 0);

      // Burst detection
      if (event.timestamp >= last10s) burstCount++;

      // Vertical scan (same IP → many ports)
      if (!portsByIP.has(ip)) portsByIP.set(ip, new Set());
      portsByIP.get(ip)!.add(port);

      // Horizontal scan (same port → many IPs)
      if (!ipsByPort.has(port)) ipsByPort.set(port, new Set());
      ipsByPort.get(port)!.add(ip);
    }

    // Burst scanning
    if (burstCount > PORTSCAN_PATTERNS.maxEventsPer10Seconds) {
      findings.push({
        id: `portscan-burst-${Date.now()}`,
        vulnerability: "portscan",
        severity: "high",
        score: 70,
        evidence: [{ pattern: "burst", payload: String(burstCount) }],
      });
    }

    // Vertical scan
    for (const [ip, ports] of portsByIP.entries()) {
      if (ports.size > PORTSCAN_PATTERNS.maxPortsPerIP) {
        findings.push({
          id: `portscan-vertical-${Date.now()}`,
          vulnerability: "portscan",
          severity: "high",
          score: 80,
          evidence: [
            { pattern: "vertical_scan", payload: `${ip}:${ports.size}` },
          ],
        });
      }
    }

    // Horizontal scan
    for (const [port, ips] of ipsByPort.entries()) {
      if (ips.size > PORTSCAN_PATTERNS.maxIPsPerPort) {
        findings.push({
          id: `portscan-horizontal-${Date.now()}`,
          vulnerability: "portscan",
          severity: "medium",
          score: 50,
          evidence: [
            { pattern: "horizontal_scan", payload: `${port}:${ips.size}` },
          ],
        });
      }
    }

    return findings;
  }
}

import { RATELIMIT_PATTERNS } from "./rate-limit.patterns";
import {
  ScanDetector,
  ScanContext,
  ScanFinding,
} from "../../../core/scan.types";

export class RateLimitDetector implements ScanDetector {
  readonly id = "ratelimit-detector";
  readonly name = "Rate Limit Detector";

  applies(context: ScanContext): boolean {
    return context.events.some((e) => e.source === "http");
  }

  execute(context: ScanContext): ScanFinding[] {
    const findings: ScanFinding[] = [];
    const events = context.events.filter((e) => e.source === "http");

    if (events.length === 0) return findings;

    // Group by IP
    const byIP = new Map<string, number>();
    // Group by path
    const byPath = new Map<string, number>();
    // Time windows
    const lastMinute = Date.now() - 60_000;
    const last10Seconds = Date.now() - 10_000;

    let countLastMinute = 0;
    let countLast10Seconds = 0;

    for (const event of events) {
      const meta = event.metadata || {};
      const ip = meta.ip || "unknown";
      const path = meta.path || "unknown";

      // Count per IP
      byIP.set(ip, (byIP.get(ip) || 0) + 1);

      // Count per path
      byPath.set(path, (byPath.get(path) || 0) + 1);

      // Time windows
      if (event.timestamp >= lastMinute) countLastMinute++;
      if (event.timestamp >= last10Seconds) countLast10Seconds++;
    }

    // Check thresholds
    if (countLastMinute > RATELIMIT_PATTERNS.maxRequestsPerMinute) {
      findings.push({
        id: `ratelimit-minute-${Date.now()}`,
        vulnerability: "rate_limit",
        severity: "medium",
        score: 30,
        evidence: [
          { pattern: "requests_per_minute", payload: String(countLastMinute) },
        ],
      });
    }

    if (countLast10Seconds > RATELIMIT_PATTERNS.maxRequestsPer10Seconds) {
      findings.push({
        id: `ratelimit-burst-${Date.now()}`,
        vulnerability: "rate_limit",
        severity: "high",
        score: 50,
        evidence: [
          {
            pattern: "requests_per_10_seconds",
            payload: String(countLast10Seconds),
          },
        ],
      });
    }

    for (const [ip, count] of byIP.entries()) {
      if (count > RATELIMIT_PATTERNS.maxRequestsPerIP) {
        findings.push({
          id: `ratelimit-ip-${Date.now()}`,
          vulnerability: "rate_limit",
          severity: "high",
          score: 60,
          evidence: [{ pattern: "requests_per_ip", payload: `${ip}:${count}` }],
        });
      }
    }

    for (const [path, count] of byPath.entries()) {
      if (count > RATELIMIT_PATTERNS.maxRequestsPerPathPerMinute) {
        findings.push({
          id: `ratelimit-path-${Date.now()}`,
          vulnerability: "rate_limit",
          severity: "medium",
          score: 40,
          evidence: [
            { pattern: "requests_per_path", payload: `${path}:${count}` },
          ],
        });
      }
    }

    return findings;
  }
}

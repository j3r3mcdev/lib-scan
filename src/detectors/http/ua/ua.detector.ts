import { UA_PATTERNS } from "./ua.patterns.js";
import {
  ScanDetector,
  ScanContext,
  ScanFinding,
} from "../../../core/scan.types.js";

export class UADetector implements ScanDetector {
  readonly id = "ua-detector";
  readonly name = "User-Agent Anomaly Detector";

  applies(context: ScanContext): boolean {
    return context.events.some((e) => e.source === "http");
  }

  execute(context: ScanContext): ScanFinding[] {
    const findings: ScanFinding[] = [];

    for (const event of context.events) {
      const meta = event.metadata || {};
      const headers = meta.headers;

      if (!headers) continue;

      const ua = String(headers["user-agent"] || "");

      for (const pattern of UA_PATTERNS) {
        if (pattern.test(ua)) {
          findings.push({
            id: `ua-${Date.now()}`,
            vulnerability: "ua",
            severity: "medium",
            score: 20,
            evidence: [
              {
                pattern: pattern.source,
                payload: ua,
              },
            ],
          });
        }
      }
    }

    return findings;
  }
}

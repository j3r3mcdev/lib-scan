import { IP_PATTERNS } from "./ip.patterns";
import {
  ScanDetector,
  ScanContext,
  ScanFinding,
} from "../../../core/scan.types";

export class IPDetector implements ScanDetector {
  readonly id = "ip-detector";
  readonly name = "IP Pattern Detector";

  applies(context: ScanContext): boolean {
    return context.events.some((e) => e.source === "http");
  }

  execute(context: ScanContext): ScanFinding[] {
    const findings: ScanFinding[] = [];

    for (const event of context.events) {
      if (event.source !== "http") continue;

      const payloads: string[] = [];

      if (event.payload) payloads.push(String(event.payload));

      const meta = event.metadata || {};
      if (meta.ip) payloads.push(String(meta.ip));
      if (meta.query) payloads.push(JSON.stringify(meta.query));
      if (meta.path) payloads.push(String(meta.path));
      if (meta.headers) payloads.push(JSON.stringify(meta.headers));
      if (meta.body) payloads.push(JSON.stringify(meta.body));

      for (const payload of payloads) {
        for (const pattern of IP_PATTERNS) {
          if (pattern.test(payload)) {
            findings.push({
              id: `ip-${Date.now()}`,
              vulnerability: "ip",
              severity: "low",
              score: 15,
              evidence: [
                {
                  pattern: pattern.source,
                  payload,
                },
              ],
            });
          }
        }
      }
    }

    return findings;
  }
}

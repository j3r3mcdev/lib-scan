import { DNS_PATTERNS } from "./dns.patterns";
import {
  ScanDetector,
  ScanContext,
  ScanFinding,
} from "../../../core/scan.types";

export class DNSDetector implements ScanDetector {
  readonly id = "dns-detector";
  readonly name = "DNS Injection / Rebinding Detector";

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
      if (meta.query) payloads.push(JSON.stringify(meta.query));
      if (meta.path) payloads.push(String(meta.path));
      if (meta.headers) payloads.push(JSON.stringify(meta.headers));
      if (meta.body) payloads.push(JSON.stringify(meta.body));

      for (const payload of payloads) {
        for (const pattern of DNS_PATTERNS) {
          if (pattern.test(payload)) {
            findings.push({
              id: `dns-${Date.now()}`,
              vulnerability: "dns",
              severity: "medium",
              score: 45,
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

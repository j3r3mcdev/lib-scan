import { SSTI_PATTERNS } from "./ssti.patterns.js";
import {
  ScanDetector,
  ScanContext,
  ScanFinding,
} from "../../../core/scan.types.js";

export class SSTIDetector implements ScanDetector {
  readonly id = "ssti-detector";
  readonly name = "Server-Side Template Injection Detector";

  applies(context: ScanContext): boolean {
    return context.events.some((e) => e.source === "http");
  }

  execute(context: ScanContext): ScanFinding[] {
    const findings: ScanFinding[] = [];

    for (const event of context.events) {
      const payloads: string[] = [];

      if (event.payload) payloads.push(String(event.payload));

      const meta = event.metadata || {};
      if (meta.query) payloads.push(JSON.stringify(meta.query));
      if (meta.path) payloads.push(String(meta.path));
      if (meta.headers) payloads.push(JSON.stringify(meta.headers));
      if (meta.body) payloads.push(JSON.stringify(meta.body));

      for (const payload of payloads) {
        for (const pattern of SSTI_PATTERNS) {
          if (pattern.test(payload)) {
            findings.push({
              id: `ssti-${Date.now()}`,
              vulnerability: "ssti",
              severity: "critical",
              score: 85,
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

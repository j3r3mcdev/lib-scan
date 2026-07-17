import { RFI_PATTERNS } from "./rfi.patterns.js";
import {
  ScanDetector,
  ScanContext,
  ScanFinding,
} from "../../../core/scan.types.js";

export class RFIDetector implements ScanDetector {
  readonly id = "rfi-detector";
  readonly name = "Remote File Inclusion Detector";

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
        for (const pattern of RFI_PATTERNS) {
          if (pattern.test(payload)) {
            findings.push({
              id: `rfi-${Date.now()}`,
              vulnerability: "rfi",
              severity: "high",
              score: 60,
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

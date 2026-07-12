import { CRLF_PATTERNS } from "./crlf.patterns";
import {
  ScanDetector,
  ScanContext,
  ScanFinding,
} from "../../../core/scan.types";

export class CRLFDetector implements ScanDetector {
  readonly id = "crlf-detector";
  readonly name = "CRLF Injection Detector";

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
        for (const pattern of CRLF_PATTERNS) {
          if (pattern.test(payload)) {
            findings.push({
              id: `crlf-${Date.now()}`,
              vulnerability: "crlf",
              severity: "high",
              score: 50,
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

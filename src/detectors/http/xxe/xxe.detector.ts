import { XXE_PATTERNS } from "./xxe.patterns";
import {
  ScanDetector,
  ScanContext,
  ScanFinding,
} from "../../../core/scan.types";

export class XXEDetector implements ScanDetector {
  readonly id = "xxe-detector";
  readonly name = "XML External Entity Injection Detector";

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
        for (const pattern of XXE_PATTERNS) {
          if (pattern.test(payload)) {
            findings.push({
              id: `xxe-${Date.now()}`,
              vulnerability: "xxe",
              severity: "critical",
              score: 90,
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

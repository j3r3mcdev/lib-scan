import { LFI_PATTERNS } from "./lfi.patterns";
import { ScanDetector, ScanContext, ScanFinding } from "../../core/scan.types";

export class LFIDetector implements ScanDetector {
  readonly id = "lfi-detector";
  readonly name = "Local File Inclusion Detector";

  applies(context: ScanContext): boolean {
    return context.events.some((e) => e.source === "http");
  }

  execute(context: ScanContext): ScanFinding[] {
    const findings: ScanFinding[] = [];

    for (const event of context.events) {
      const payloads: string[] = [];

      if (event.payload) payloads.push(event.payload);

      const meta = event.metadata || {};
      if (meta.query) payloads.push(JSON.stringify(meta.query));
      if (meta.path) payloads.push(String(meta.path));
      if (meta.headers) payloads.push(JSON.stringify(meta.headers));
      if (meta.body) payloads.push(JSON.stringify(meta.body));

      for (const payload of payloads) {
        for (const pattern of LFI_PATTERNS) {
          if (pattern.test(payload)) {
            findings.push({
              id: `lfi-${Date.now()}`,
              vulnerability: "lfi",
              severity: "high",
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

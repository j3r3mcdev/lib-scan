import { OPEN_REDIRECT_PATTERNS } from "./openredirect.patterns.js";
import {
  ScanDetector,
  ScanContext,
  ScanFinding,
} from "../../../core/scan.types.js";

export class OpenRedirectDetector implements ScanDetector {
  readonly id = "openredirect-detector";
  readonly name = "Open Redirect Detector";

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
        for (const pattern of OPEN_REDIRECT_PATTERNS) {
          if (pattern.test(payload)) {
            findings.push({
              id: `openredirect-${Date.now()}`,
              vulnerability: "open_redirect",
              severity: "medium",
              score: 25,
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

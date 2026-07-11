import { HEADER_PATTERNS } from "./header.patterns";
import { ScanDetector, ScanContext, ScanFinding } from "../../core/scan.types";

export class HeaderDetector implements ScanDetector {
  readonly id = "header-detector";
  readonly name = "Header Attack Detector";

  applies(context: ScanContext): boolean {
    return context.events.some((e) => e.source === "http");
  }

  execute(context: ScanContext): ScanFinding[] {
    const findings: ScanFinding[] = [];

    for (const event of context.events) {
      const meta = event.metadata || {};
      const headers = meta.headers;

      if (!headers) continue;

      const payload = JSON.stringify(headers);

      for (const pattern of HEADER_PATTERNS) {
        if (pattern.test(payload)) {
          findings.push({
            id: `header-${Date.now()}`,
            vulnerability: "http",
            severity: "medium",
            score: 30,
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

    return findings;
  }
}

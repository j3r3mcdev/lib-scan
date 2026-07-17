import { JWT_PATTERNS } from "./jwt.patterns.js";
import {
  ScanDetector,
  ScanContext,
  ScanFinding,
} from "../../../core/scan.types.js";

export class JWTDetector implements ScanDetector {
  readonly id = "jwt-detector";
  readonly name = "JWT Security Detector";

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
        for (const pattern of JWT_PATTERNS) {
          if (pattern.test(payload)) {
            findings.push({
              id: `jwt-${Date.now()}`,
              vulnerability: "jwt",
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

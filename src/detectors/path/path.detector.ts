import { PATH_PATTERNS } from "./path.patterns.js";
import {
  ScanDetector,
  ScanContext,
  ScanFinding,
} from "../../core/scan.types.js";

export class PathTraversalDetector implements ScanDetector {
  readonly id = "path-detector";
  readonly name = "Path Traversal Detector";

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
        for (const pattern of PATH_PATTERNS) {
          if (pattern.test(payload)) {
            findings.push({
              id: `path-${Date.now()}`,
              vulnerability: "path_traversal",
              severity: "high",
              score: 40,
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

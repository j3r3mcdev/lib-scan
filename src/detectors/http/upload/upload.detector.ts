import { UPLOAD_PATTERNS } from "./upload.patterns.js";
import {
  ScanDetector,
  ScanContext,
  ScanFinding,
} from "../../../core/scan.types.js";

export class UploadDetector implements ScanDetector {
  readonly id = "upload-detector";
  readonly name = "Malicious Upload Detector";

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
      if (meta.file) payloads.push(JSON.stringify(meta.file)); // file metadata

      for (const payload of payloads) {
        for (const pattern of UPLOAD_PATTERNS) {
          if (pattern.test(payload)) {
            findings.push({
              id: `upload-${Date.now()}`,
              vulnerability: "upload",
              severity: "high",
              score: 75,
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

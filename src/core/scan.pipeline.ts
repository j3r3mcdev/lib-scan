import {
  ScanContext,
  ScanDetector,
  ScanFinding,
  ScanResult,
} from "./scan.types.js";
import { ScanError } from "./scan.error.js";

export class ScanPipeline {
  constructor(private readonly detectors: ScanDetector[]) {}

  run(context: ScanContext): ScanResult {
    if (!context) {
      throw new ScanError("Invalid scan context", "PIPELINE_ERROR");
    }

    const findings: ScanFinding[] = [];

    for (const detector of this.detectors) {
      try {
        if (detector.applies(context)) {
          const f = detector.execute(context);
          if (Array.isArray(f)) findings.push(...f);
        }
      } catch (err) {
        throw new ScanError(
          `Detector failed: ${detector.id}`,
          "DETECTOR_ERROR",
          {
            cause: err,
          },
        );
      }
    }

    const score = findings.reduce((acc, f) => acc + f.score, 0);

    const severity =
      score >= 80
        ? "critical"
        : score >= 50
          ? "high"
          : score >= 20
            ? "medium"
            : "low";

    return {
      score,
      severity,
      findings,
      chains: context.chains,
      timestamp: Date.now(),
      metadata: context.metadata,
    };
  }
}

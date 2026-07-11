import { ScanContext, ScanResult, Severity } from "./scan.types";

export class ScanResultBuilder {
  static build(context: ScanContext): ScanResult {
    const score = context.findings.reduce((acc, f) => acc + f.score, 0);

    const severity: Severity =
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
      findings: context.findings,
      chains: context.chains,
      timestamp: Date.now(),
      metadata: context.metadata,
    };
  }
}

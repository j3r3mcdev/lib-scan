import { ScanContext, NormalizedEvent, ScanFinding } from "./scan.types";

export class ScanContextImpl implements ScanContext {
  events: NormalizedEvent[] = [];
  metadata: Record<string, any> = {};
  findings: ScanFinding[] = [];
  chains = [];

  addEvent(event: NormalizedEvent) {
    this.events.push(event);
  }

  addFinding(finding: ScanFinding) {
    this.findings.push(finding);
  }

  setMetadata(key: string, value: any) {
    this.metadata[key] = value;
  }
}

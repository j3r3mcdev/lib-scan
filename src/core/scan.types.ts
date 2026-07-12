/**
 * Types scoring répliqués localement pour compatibilité,
 * sans dépendance vers le service scoring.
 */

export type Vulnerability =
  | "xss"
  | "sqli"
  | "path_traversal"
  | "lfi"
  | "header_injection"
  | "command_injection"
  | "crlf"
  | "nosql"
  | "ssti"
  | "xxe"
  | "prototype_pollution"
  | "rfi"
  | "ua"
  | "mime"
  | "upload"
  | "anomaly"
  | "rate_limit"
  | "ip"
  | "dns"
  | "portscan"
  | "open_redirect" // ✔ FIX
  | "jwt";

export type Severity = "low" | "medium" | "high" | "critical";

export type EventSource = "http" | "dns" | "waf" | "scan" | "oast";

export interface NormalizedEvent {
  id: string;
  source: EventSource;
  protocol?: string;
  timestamp: number;
  payload?: string;
  metadata: Record<string, any>;
}

export interface CorrelationChain {
  id: string;
  type: Vulnerability;
  events: NormalizedEvent[];
  confidence: number;
  correlationScore?: number;
  eventCount?: number;
  sourceCount?: number;
  attackLikelihood?: number;
}

export interface ScanFinding {
  id: string;
  vulnerability: Vulnerability;
  severity: Severity;
  score: number;
  evidence: ScanEvidence[];
  details?: string;
}

export interface ScanContext {
  events: NormalizedEvent[];
  metadata: Record<string, any>;
  findings: ScanFinding[];
  chains: CorrelationChain[];
}

export interface ScanDetector {
  id: string;
  name: string;
  description?: string;

  applies(context: ScanContext): boolean;
  execute(context: ScanContext): ScanFinding[];
}

export interface ScanAdapter {
  id: string;
  name: string;

  transform(context: ScanContext): ScanContext;
}

export interface ScanResult {
  score: number;
  severity: Severity;
  findings: ScanFinding[];
  chains: CorrelationChain[];
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ScanEvidence {
  pattern: string;
  payload: string;
}

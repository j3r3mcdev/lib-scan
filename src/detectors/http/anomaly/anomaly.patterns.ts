export const ANOMALY_PATTERNS: RegExp[] = [
  // Very long payloads (fuzzing / overflow)
  /.{5000,}/s,

  // Repeated characters (fuzzing)
  /(.)\1{100,}/,

  // Suspicious JSON structures
  /\{\s*\{\s*\{/,
  /\[\s*\[\s*\[/,

  // High entropy payloads (encoded fuzzing)
  /[A-Za-z0-9+/]{200,}={0,2}/,

  // Strange unicode characters
  /[\u202E\u202D\u202A\u202B]/, // RTL override, etc.

  // Null bytes
  /\x00/,

  // Mixed encoding anomalies
  /%00/i,
  /%FF/i,
  /%C0%AF/i, // double-encoding slash bypass
];

export const CRLF_PATTERNS: RegExp[] = [
  // Raw CRLF injection
  /\r\n/i,
  /\n\r/i,

  // Encoded CRLF
  /%0d%0a/i,
  /%0a%0d/i,
  /%0d/i,
  /%0a/i,

  // Header injection payloads
  /\r\n[^\s]+:/i, // CRLF + header
  /%0d%0a[^\s]+:/i, // encoded CRLF + header

  // Common malicious header injections
  /\r\nSet-Cookie:/i,
  /\r\nLocation:/i,
  /\r\nContent-Length:/i,
];

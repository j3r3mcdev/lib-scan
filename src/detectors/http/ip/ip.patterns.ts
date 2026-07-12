export const IP_PATTERNS: RegExp[] = [
  // Private ranges
  /\b10\.(?:\d{1,3}\.){2}\d{1,3}\b/,
  /\b192\.168\.(?:\d{1,3})\.\d{1,3}\b/,
  /\b172\.(?:1[6-9]|2\d|3[0-1])\.(?:\d{1,3})\.\d{1,3}\b/,

  // Loopback / localhost
  /\b127\.0\.0\.1\b/,
  /\blocalhost\b/i,

  // Suspicious / generic patterns (IPv4)
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/,

  // IPv6 generic
  /\b([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}\b/i,

  // Encoded IPs
  /127%2E0%2E0%2E1/i,
  /localhost%2F?/i,
];

export const DNS_PATTERNS: RegExp[] = [
  // DNS rebinding targets
  /127\.0\.0\.1/i,
  /localhost/i,
  /0\.0\.0\.0/i,
  /192\.168\.\d{1,3}\.\d{1,3}/i,
  /10\.\d{1,3}\.\d{1,3}\.\d{1,3}/i,

  // Suspicious TLDs
  /\.onion\b/i,
  /\.local\b/i,
  /\.internal\b/i,
  /\.lan\b/i,

  // DNS exfiltration (long subdomains)
  /([a-zA-Z0-9]{40,}\.)+[a-zA-Z]{2,}/,

  // Base64-like DNS labels (tunneling)
  /\b([A-Za-z0-9+/]{20,}=*)\./,

  // DynDNS / fast‑flux services
  /\.duckdns\.org/i,
  /\.no-ip\.org/i,
  /\.dynu\.net/i,

  // Encoded DNS payloads
  /%2Eonion/i,
  /%2Elocal/i,
];

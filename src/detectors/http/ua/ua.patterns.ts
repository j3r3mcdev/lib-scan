export const UA_PATTERNS: RegExp[] = [
  // Command-line tools
  /curl/i,
  /wget/i,
  /powershell/i,
  /python-requests/i,
  /libwww-perl/i,
  /java/i,

  // Security scanners
  /sqlmap/i,
  /acunetix/i,
  /nessus/i,
  /nikto/i,
  /burpsuite/i,
  /owasp/i,

  // Empty or missing UA
  /^$/i,
  /unknown/i,

  // Suspicious automation
  /bot/i,
  /crawler/i,
  /spider/i,
  /scan/i,
];

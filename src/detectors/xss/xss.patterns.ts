export const XSS_PATTERNS: RegExp[] = [
  /<script\b[^>]*>/i,
  /<\/script>/i,
  /javascript:/i,
  /on\w+=/i,
  /alert\s*\(/i,
  /prompt\s*\(/i,
  /confirm\s*\(/i,
  /document\.cookie/i,
  /<img\b[^>]*src=/i,
  /<iframe\b/i,
  /<svg\b[^>]*on\w+=/i,
  /<body\b[^>]*on\w+=/i,
];

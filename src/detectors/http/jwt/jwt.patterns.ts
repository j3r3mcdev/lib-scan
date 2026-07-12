export const JWT_PATTERNS: RegExp[] = [
  // alg:none attack
  /"alg"\s*:\s*"none"/i,

  // Weak algorithms (HS256 etc.)
  /"alg"\s*:\s*"HS256"/i,
  /"alg"\s*:\s*"HS384"/i,
  /"alg"\s*:\s*"HS512"/i,

  // Public key confusion (HS256 with RSA public key)
  /-----BEGIN PUBLIC KEY-----/i,

  // Suspicious kid values
  /"kid"\s*:\s*".*\.\/.*"/i, // path traversal
  /"kid"\s*:\s*"http/i, // remote key loading

  // Oversized base64 segments (tunneling / exfil)
  /\.[A-Za-z0-9+/]{200,}\./,

  // JWT structure
  /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
];

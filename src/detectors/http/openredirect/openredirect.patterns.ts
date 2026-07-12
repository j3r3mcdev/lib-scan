export const OPEN_REDIRECT_PATTERNS: RegExp[] = [
  // Direct external URLs
  /^https?:\/\//i,
  /^\/\/[^/]/i, // protocol-relative redirect

  // Encoded external URLs
  /%2f%2f/i,
  /%3a%2f%2f/i,

  // JavaScript-based redirects
  /javascript:/i,

  // Redirect parameters commonly abused
  /\bredirect=\/\//i,
  /\burl=\/\//i,
  /\bnext=\/\//i,
  /\breturn=\/\//i,
  /\bcontinue=\/\//i,

  // Open redirect with domain injection
  /[?&](redirect|url|next|return|continue)=https?:\/\//i,
];

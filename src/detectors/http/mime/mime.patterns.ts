export const MIME_PATTERNS: RegExp[] = [
  // Dangerous MIME types
  /text\/html/i,
  /application\/x-php/i,
  /application\/x-javascript/i,
  /application\/x-sh/i,
  /application\/x-executable/i,

  // Polyglot / disguised files
  /image\/svg\+xml/i, // SVG can contain JS
  /application\/octet-stream/i, // often used to hide payloads

  // Suspicious content-type overrides
  /multipart\/form-data;\s*boundary=/i,
  /content-type:\s*text\/html/i,
  /content-type:\s*application\/x-php/i,

  // Extensions disguised as MIME
  /\.php[3457]?$/i,
  /\.phtml$/i,
  /\.jsp$/i,
  /\.aspx$/i,
  /\.sh$/i,
  /\.exe$/i,

  // Encoded MIME types
  /text%2Fhtml/i,
  /application%2Fx-php/i,
  /application%2Fx-javascript/i,
];

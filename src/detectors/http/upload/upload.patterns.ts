export const UPLOAD_PATTERNS: RegExp[] = [
  // Dangerous extensions
  /\.php[3457]?$/i,
  /\.phtml$/i,
  /\.phar$/i,
  /\.jsp$/i,
  /\.aspx$/i,
  /\.sh$/i,
  /\.exe$/i,
  /\.dll$/i,
  /\.bat$/i,
  /\.cmd$/i,

  // Polyglot / disguised files
  /\.svg$/i, // SVG can contain JS
  /\.html?$/i, // HTML upload = XSS vector
  /\.js$/i,

  // MIME types often used to bypass filters
  /application\/octet-stream/i,
  /application\/x-php/i,
  /application\/x-executable/i,
  /application\/x-sh/i,

  // Encoded extensions
  /%2Ephp/i,
  /%2Ephtml/i,
  /%2Ejsp/i,
  /%2Easpx/i,
  /%2Eexe/i,

  // Suspicious content-type overrides
  /content-type:\s*application\/x-php/i,
  /content-type:\s*application\/octet-stream/i,
];

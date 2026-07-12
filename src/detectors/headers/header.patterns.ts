export const HEADER_PATTERNS: RegExp[] = [
  // XSS dans les headers
  /<script\b[^>]*>/i,
  /javascript:/i,
  /on\w+=/i,

  // SQLi dans les headers
  /\bor\b\s+\d+=\d+/i,
  /\bunion\b\s+select\b/i,
  /['"]\s*or\s*['"]?\d+['"]?\s*=\s*['"]?\d+/i,

  // Path Traversal / LFI dans les headers
  /\.\.\//i,
  /\.\.\\/,
  /\/etc\/passwd/i,
  /php:\/\/input/i,
  /file:\/\/\//i,

  // RCE patterns dans les headers
  /\bexec\b/i,
  /\bpassthru\b/i,
  /\bsystem\b/i,
  /\bpopen\b/i,

  // SSRF dans les headers
  /\bhttp:\/\/169\.254\.169\.254\b/i,
  /\bmetadata\.googleinternal\b/i,

  // Header poisoning
  /x-forwarded-for.*\.\.\//i,
  /x-forwarded-for.*or\s+\d+=\d+/i,
  /referer.*<script/i,
  /cookie=.*union\s+select/i,
];

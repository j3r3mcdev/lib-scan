export const RFI_PATTERNS: RegExp[] = [
  // Direct remote URLs
  /https?:\/\/[^\s]+/i,
  /ftp:\/\/[^\s]+/i,

  // Encoded remote URLs
  /%3a%2f%2f/i, // ://
  /%2f%2f/i, // //

  // Common RFI parameters
  /\bfile=https?:\/\//i,
  /\bpage=ftp:\/\//i,
  /\binclude=\/\//i,
  /\binc=\/\//i,

  // PHP wrappers often used in RFI
  /php:\/\/input/i,
  /php:\/\/filter/i,
  /php:\/\/stdin/i,

  // Known RFI payloads
  /\?cmd=/i,
  /\?exec=/i,
  /shell\.txt/i,
];

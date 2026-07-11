export const LFI_PATTERNS: RegExp[] = [
  /\.\.\//i, // ../
  /\.\.\\/, // ..\ (Windows)
  /%2e%2e%2f/i, // URL encoded ../
  /%2e%2e\\%2f/i, // URL encoded ..\
  /\/etc\/passwd/i, // Unix sensitive file
  /\/etc\/shadow/i,
  /\/proc\/self\/environ/i,
  /\/var\/log\/auth\.log/i,
  /\/root/i,
  /\bphp:\/\/input\b/i, // PHP wrapper
  /\bphp:\/\/filter\b/i,
  /\bdata:\/\/text\b/i,
  /\bzip:\/\/\//i,
  /\bfile:\/\/\//i,
];

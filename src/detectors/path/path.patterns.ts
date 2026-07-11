export const PATH_PATTERNS: RegExp[] = [
  /\.\.\//i, // ../
  /\.\.\\/, // ..\ (Windows)
  /%2e%2e%2f/i, // URL encoded ../
  /%2e%2e\\%2f/i, // URL encoded ..\
  /\/etc\/passwd/i, // Unix sensitive file
  /c:\\windows\\system32/i, // Windows sensitive dir
  /\/var\/log/i, // Unix logs
  /\/root/i, // Unix root
  /\bfile:/i, // file://
  /\bphp:\/\/filter/i, // PHP filter wrapper
  /\bzip:\/\/\//i, // zip://
];

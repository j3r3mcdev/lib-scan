export const COMMAND_PATTERNS: RegExp[] = [
  // Basic command separators
  /;/,
  /\|\|/,
  /\|/,
  /&&/,

  // Command keywords
  /\b(cat|ls|whoami|id|pwd|curl|wget|nc|netcat|bash|sh)\b/i,

  // Windows commands
  /\b(dir|type|powershell|cmd\.exe)\b/i,

  // Injection operators
  /\$\(.*\)/, // $(command)
  /`.*`/, // `command`
  /\bexec\b/i,
  /\bsystem\b/i,

  // Encoded payloads
  /%26%26/, // &&
  /%7C/, // |
  /%3B/, // ;
];

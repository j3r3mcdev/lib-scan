export const PROTOTYPE_POLLUTION_PATTERNS: RegExp[] = [
  // Direct prototype pollution keys
  /__proto__/i,
  /\bconstructor\b/i,
  /\bprototype\b/i,

  // Encoded prototype pollution
  /%5F%5Fproto%5F%5F/i,   // __proto__
  /%63onstructor/i,       // constructor
  /%70rototype/i,         // prototype

  // JSON-style pollution
  /"\s*__proto__\s*"\s*:/i,
  /"\s*constructor\s*"\s*:/i,
  /"\s*prototype\s*"\s*:/i,

  // Query-style pollution
  /\b__proto__=/i,
  /\bconstructor=/i,
  /\bprototype=/i,

  // Nested pollution
  /\b__proto__\[/i,
  /\bconstructor\[/i,
  /\bprototype\[/i,
];

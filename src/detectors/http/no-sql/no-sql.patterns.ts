export const NOSQL_PATTERNS: RegExp[] = [
  // Mongo-style operators
  /\$ne\b/i,
  /\$gt\b/i,
  /\$lt\b/i,
  /\$in\b/i,
  /\$nin\b/i,
  /\$or\b/i,
  /\$and\b/i,
  /\$regex\b/i,

  // Typical NoSQL payloads
  /"\$ne":\s*null/i,
  /"\$gt":\s*""/i,
  /"\$or":\s*\[/i,
  /"\$regex":\s*".*"/i,

  // Boolean-based NoSQL
  /true\)\s*\|\|\s*true/i,
  /false\)\s*\|\|\s*true/i,

  // URL-encoded operators
  /%24ne/i,
  /%24gt/i,
  /%24lt/i,
  /%24in/i,
  /%24or/i,
  /%24regex/i,
];

export const XXE_PATTERNS: RegExp[] = [
  // Basic DOCTYPE declarations
  /<!DOCTYPE/i,
  /<!ENTITY/i,

  // External entity definitions
  /SYSTEM\s+"[^"]+"/i,
  /SYSTEM\s+'[^']+'/i,
  /PUBLIC\s+"[^"]+"/i,

  // Common XXE payloads
  /<!ENTITY\s+[^>]*\s+SYSTEM/i,
  /<!ENTITY\s+[^>]*\s+PUBLIC/i,
  /<!ENTITY\s+[^>]*\s+\"file:\/\//i,
  /file:\/\/\/etc\/passwd/i,
  /php:\/\/filter/i,

  // Billion laughs attack
  /<!ENTITY\s+lol/i,
  /<!ENTITY\s+lol\d+/i,

  // Encoded XXE
  /%3C!DOCTYPE/i,
  /%3C!ENTITY/i,
  /%3CSYSTEM/i,
];

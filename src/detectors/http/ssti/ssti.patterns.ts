export const SSTI_PATTERNS: RegExp[] = [
  // Jinja2 / Flask / Tornado
  /\{\{.*\}\}/, // {{ payload }}
  /\{\%.*\%\}/, // {% block %}
  /\{\{7\*7\}\}/, // arithmetic test
  /\{\{['"]?test['"]?\}\}/, // simple injection

  // Twig / Symfony
  /\{\{.*\}\}/,
  /\{\%.*\%\}/,

  // Velocity / Java
  /\$\{.*\}/, // ${payload}
  /\#set\s*\(.+\)/i,

  // ERB / Ruby
  /<%=?\s*.*\s*%>/,

  // Go templates
  /\{\{.*\}\}/,

  // Common SSTI payloads
  /\{\{7\*7\}\}/,
  /\$\{7\*7\}/,
  /<%=7\*7%>/,

  // Encoded SSTI
  /%7B%7B.*%7D%7D/i, // {{ }}
  /%24%7B.*%7D/i, // ${ }
];

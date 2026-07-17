/**
 * Point d’entrée principal de lib-scan.
 * Exporte tous les détecteurs, patterns et types.
 */

/* ----------------------------- Core Types ----------------------------- */
export * from "./core/scan.types.js";

/* ----------------------------- Headers ----------------------------- */
export * from "./detectors/headers/header.detector.js";
export * from "./detectors/headers/header.patterns.js";

/* ----------------------------- HTTP ----------------------------- */

/* anomaly */
export * from "./detectors/http/anomaly/anomaly.detector.js";
export * from "./detectors/http/anomaly/anomaly.patterns.js";

/* command injection */
export * from "./detectors/http/command/command.detector.js";
export * from "./detectors/http/command/command.patterns.js";

/* crlf */
export * from "./detectors/http/crlf/crlf.detector.js";
export * from "./detectors/http/crlf/crlf.patterns.js";

/* dns */
export * from "./detectors/http/dns/dns.detector.js";
export * from "./detectors/http/dns/dns.patterns.js";

/* ip */
export * from "./detectors/http/ip/ip.detector.js";
export * from "./detectors/http/ip/ip.patterns.js";

/* jwt */
export * from "./detectors/http/jwt/jwt.detector.js";
export * from "./detectors/http/jwt/jwt.patterns.js";

/* mime */
export * from "./detectors/http/mime/mime.detector.js";
export * from "./detectors/http/mime/mime.patterns.js";

/* no-sql */
export * from "./detectors/http/no-sql/no-sql.detector.js";
export * from "./detectors/http/no-sql/no-sql.patterns.js";

/* open redirect */
export * from "./detectors/http/openredirect/openredirect.detector.js";
export * from "./detectors/http/openredirect/openredirect.patterns.js";

/* prototype pollution */
export * from "./detectors/http/prototype-pollution/prototype-pollution.detectors.js";
export * from "./detectors/http/prototype-pollution/prototype-pollution.patterns.js";

/* rate limit */
export * from "./detectors/http/rate-limit/rate-limit.detector.js";
export * from "./detectors/http/rate-limit/rate-limit.patterns.js";

/* rfi */
export * from "./detectors/http/rfi/rfi.detector.js";
export * from "./detectors/http/rfi/rfi.patterns.js";

/* ssti */
export * from "./detectors/http/ssti/ssti.detector.js";
export * from "./detectors/http/ssti/ssti.patterns.js";

/* ua */
export * from "./detectors/http/ua/ua.detector.js";
export * from "./detectors/http/ua/ua.patterns.js";

/* upload */
export * from "./detectors/http/upload/upload.detector.js";
export * from "./detectors/http/upload/upload.patterns.js";

/* xxe */
export * from "./detectors/http/xxe/xxe.detector.js";
export * from "./detectors/http/xxe/xxe.patterns.js";

/* ----------------------------- LFI ----------------------------- */
export * from "./detectors/lfi/lfi.detector.js";
export * from "./detectors/lfi/lfi.patterns.js";

/* ----------------------------- Network ----------------------------- */
export * from "./detectors/network/portscan/portscan.detector.js";
export * from "./detectors/network/portscan/portscan.patterns.js";

/* ----------------------------- Path Traversal ----------------------------- */
export * from "./detectors/path/path.detector.js";
export * from "./detectors/path/path.patterns.js";

/* ----------------------------- SQL Injection ----------------------------- */
export * from "./detectors/sqli/sqli.detector.js";
export * from "./detectors/sqli/sqli.patterns.js";

/* ----------------------------- XSS ----------------------------- */
export * from "./detectors/xss/xss.detector.js";
export * from "./detectors/xss/xss.patterns.js";

/* ----------------------------- Instances & Pipeline ----------------------------- */
export * from "./core/scan.instance.js";
export * from "./core/scan.pipeline.js";
export * from "./core/scan.registry.js";
export * from "./core/scan.context.js";

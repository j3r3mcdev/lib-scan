export const RATELIMIT_PATTERNS = {
  maxRequestsPerMinute: 60, // seuil raisonnable
  maxRequestsPer10Seconds: 20, // burst agressif
  maxRequestsPerIP: 200, // flood IP
  maxRequestsPerPathPerMinute: 40, // brute-force endpoint
};

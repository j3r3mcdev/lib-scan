export const PORTSCAN_PATTERNS = {
  // Vertical scan (same IP, many ports)
  maxPortsPerIP: 15,

  // Horizontal scan (same port, many IPs)
  maxIPsPerPort: 20,

  // Burst scanning
  maxEventsPer10Seconds: 30,

  // Sensitive ports
  sensitivePorts: [21, 22, 23, 25, 53, 80, 443, 3306, 5432, 6379, 27017, 27018],
};

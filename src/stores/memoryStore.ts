interface MemoryEntry {
  maxRequests?: number;
  requestCount: number;
  firstRequestTime: number;
  windowMs: number;
  blockExpiresAt?: number;
}

export default class memoryStore {
  memoryMap: Map<string, MemoryEntry> = new Map();

  constructor() {
    // Set the interval to check and clean expired entries every 60 minutes
    const timeOut = 60 * 60 * 1000;
    setInterval(() => this.clearExpiredEntries(), timeOut);
  }

  // Method to set data for an ipAddress in memoryMap
  setIp(
    maxRequests: number,
    ipAddress: string,
    requestCount: number,
    firstRequestTime: number,
    windowMs: number,
    blockExpiresAt?: number
  ) {
    // Store the values in memoryMap with ipAddress as the key
    this.memoryMap.set(ipAddress, {
      maxRequests,
      requestCount,
      firstRequestTime,
      windowMs,
      blockExpiresAt,
    });
  }

  // Method to check if key is present and update the values in memoryMap
  updateIp(
    ipAddress: string,
    requestCount: number,
    firstRequestTime: number,
    windowMs: number,
    blockExpiresAt?: number
  ) {
    const existing = this.memoryMap.get(ipAddress);
    if (existing) {
      // Update the values in memoryMap
      this.memoryMap.set(ipAddress, {
        ...existing,
        requestCount,
        firstRequestTime,
        windowMs,
        blockExpiresAt,
      });
    }
  }

  resetIp(
    ipAddress: string,
    requestCount: number,
    firstRequestTime: number,
    windowMs: number,
    blockExpiresAt?: number
  ) {
    const existing = this.memoryMap.get(ipAddress);
    if (existing) {
      // Update the values in memoryMap
      this.memoryMap.set(ipAddress, {
        ...existing,
        requestCount,
        firstRequestTime,
        windowMs,
        blockExpiresAt,
      });
    }
  }

  // Method to get data for an ipAddress in memoryMap
  getIp(ipAddress: string) {
    // retrieves the values in memoryMap with ipAddress as the key
    return this.memoryMap.get(ipAddress);
  }

  // Method to delete data for an ipAddress in memoryMap
  deleteIp(ipAddress: string) {
    // Deletes the values in memoryMap with ipAddress as the key
    return this.memoryMap.delete(ipAddress);
  }

  // Method to clear only expired entries from the map
  private clearExpiredEntries() {
    console.log('Checking for expired entries...');
    const now = Date.now();
    this.memoryMap.forEach((entry, ipAddress) => {
      if (entry.blockExpiresAt && entry.blockExpiresAt > now) {
        console.log(`Removing expired entry for IP: ${ipAddress}`);
        this.memoryMap.delete(ipAddress);
      }
    });
  }
}

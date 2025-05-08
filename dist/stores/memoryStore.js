"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class memoryStore {
    constructor() {
        this.memoryMap = new Map();
        // Set the interval to check and clean expired entries every 60 minutes
        const timeOut = 60 * 60 * 1000;
        setInterval(() => this.clearExpiredEntries(), timeOut);
    }
    // Method to set data for an ipAddress in memoryMap
    setIp(ipAddress, maxRequests, requestCount, firstRequestTime, windowMs) {
        // Store the values in memoryMap with ipAddress as the key
        this.memoryMap.set(ipAddress, {
            maxRequests,
            requestCount,
            firstRequestTime,
            windowMs,
        });
    }
    // Method to check if key is present and update the values in memoryMap
    updateIp(ipAddress, requestCount, maxRequests, firstRequestTime, windowMs, blockExpiresAt) {
        const existing = this.memoryMap.get(ipAddress);
        if (existing) {
            // Update the values in memoryMap
            this.memoryMap.set(ipAddress, Object.assign(Object.assign({}, existing), { requestCount,
                maxRequests,
                firstRequestTime,
                windowMs,
                blockExpiresAt }));
        }
    }
    resetIp(ipAddress, requestCount, firstRequestTime, windowMs, blockExpiresAt) {
        const existing = this.memoryMap.get(ipAddress);
        if (existing) {
            // Update the values in memoryMap
            this.memoryMap.set(ipAddress, Object.assign(Object.assign({}, existing), { requestCount,
                firstRequestTime,
                windowMs,
                blockExpiresAt }));
        }
    }
    // Method to get data for an ipAddress in memoryMap
    getIp(ipAddress) {
        // retrieves the values in memoryMap with ipAddress as the key
        return this.memoryMap.get(ipAddress);
    }
    // Method to delete data for an ipAddress in memoryMap
    deleteIp(ipAddress) {
        // Deletes the values in memoryMap with ipAddress as the key
        this.memoryMap.delete(ipAddress);
        return `IP Data deleted: ${ipAddress}`;
    }
    // Method to clear only expired entries from the map
    clearExpiredEntries() {
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
exports.default = memoryStore;

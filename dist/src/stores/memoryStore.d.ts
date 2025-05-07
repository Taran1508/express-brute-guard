interface MemoryEntry {
    maxRequests?: number;
    requestCount: number;
    firstRequestTime: number;
    windowMs: number;
    blockExpiresAt?: number;
}
export default class memoryStore {
    memoryMap: Map<string, MemoryEntry>;
    constructor();
    setIp(maxRequests: number, ipAddress: string, requestCount: number, firstRequestTime: number, windowMs: number, blockExpiresAt?: number): void;
    updateIp(ipAddress: string, requestCount: number, firstRequestTime: number, windowMs: number, blockExpiresAt?: number): void;
    resetIp(ipAddress: string, requestCount: number, firstRequestTime: number, windowMs: number, blockExpiresAt?: number): void;
    getIp(ipAddress: string): MemoryEntry | undefined;
    deleteIp(ipAddress: string): boolean;
    private clearExpiredEntries;
}
export {};
//# sourceMappingURL=memoryStore.d.ts.map
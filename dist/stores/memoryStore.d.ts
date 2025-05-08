export interface MemoryEntry {
    maxRequests?: number;
    requestCount: number;
    firstRequestTime: number;
    windowMs: number;
    blockExpiresAt?: number;
}
export default class memoryStore {
    memoryMap: Map<string, MemoryEntry>;
    constructor();
    setIp(ipAddress: string, maxRequests: number, requestCount: number, firstRequestTime: number, windowMs: number): void;
    updateIp(ipAddress: string, requestCount: number, maxRequests: number, firstRequestTime: number, windowMs: number, blockExpiresAt?: number): void;
    resetIp(ipAddress: string, requestCount: number, firstRequestTime: number, windowMs: number, blockExpiresAt: number): void;
    getIp(ipAddress: string): MemoryEntry | undefined;
    deleteIp(ipAddress: string): string;
    private clearExpiredEntries;
}
//# sourceMappingURL=memoryStore.d.ts.map
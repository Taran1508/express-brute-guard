interface Metrics {
    maxRequests?: number;
    windowMs?: number;
    blockDuration?: number;
    resetTime?: number;
    statusCode?: number;
    errormessage?: string;
    store?: any;
    headers?: boolean;
}
declare class BruteGuard {
    maxRequests: number;
    windowMs: number;
    blockDuration: number;
    resetTime?: number;
    statusCode: number;
    errormessage: string;
    store?: any;
    headers: boolean;
    constructor(options?: Metrics);
    private isBlocked;
    private incrementRequest;
    private checkIpExist;
    private checkIpLimit;
    createGuard(req: any, res: any, next: any): any;
}
export default BruteGuard;
//# sourceMappingURL=limiter.d.ts.map
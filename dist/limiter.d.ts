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
export declare class BruteGuard {
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
    createGuard(req: any, res: any, next: any): any;
}
declare const bruteGuard: BruteGuard;
export default bruteGuard;
//# sourceMappingURL=limiter.d.ts.map
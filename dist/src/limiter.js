"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const memoryStore_1 = __importDefault(require("./stores/memoryStore"));
class BruteGuard {
    // requestCount: number;
    // firstRequestTime: number;
    constructor(options = {}) {
        this.maxRequests = options.maxRequests || 10;
        // this.requestCount = options.requestCount || 0;
        // this.firstRequestTime = options.firstRequestTime || 0;
        this.windowMs = options.windowMs || 5 * 60 * 1000;
        this.blockDuration = options.blockDuration || 3 * 60 * 1000;
        this.resetTime = options.resetTime || Date.now() + this.windowMs;
        this.statusCode = options.statusCode || 429;
        this.errormessage = options.errormessage || 'Too many Requests';
        this.store = options.store || new memoryStore_1.default();
        this.headers = options.headers !== false;
    }
    isBlocked(res, exist) {
        if (exist.blockExpiresAt && Date.now() < exist.blockExpiresAt) {
            this.blockDuration = exist.blockDuration;
            if (this.headers) {
                res.setHeader('Retry-After', this.blockDuration);
            }
            res.status(this.statusCode).json({ message: `${this.errormessage}` });
            return true;
        }
        return false;
    }
    incrementRequest(exist, ipAddress) {
        if (exist) {
            exist.requestCount++;
            this.store.updateIp(ipAddress, {
                firstRequestTime: exist.firstRequestTime,
                windowMs: exist.windowMs,
                blockExpiresAt: exist.blockExpiresAt,
                requestCount: exist.requestCount,
            });
        }
    }
    // If the IP is already present, increment the request count
    checkIpExist(res, exist, ipAddress) {
        if (exist && this.isBlocked(res, exist)) {
            return true;
        }
        if (exist) {
            this.incrementRequest(exist, ipAddress);
        }
        return false;
    }
    // Check rate limit
    checkIpLimit(res, exist, ipAddress) {
        if ((exist === null || exist === void 0 ? void 0 : exist.requestCount) > this.maxRequests) {
            if (this.headers) {
                res.setHeader('X-RateLimit-Reset', this.resetTime);
                res.setHeader('Retry-After', this.blockDuration);
            }
            this.store.updateIp(ipAddress, {
                requestCount: exist.requestCount,
                firstRequestTime: exist.firstRequestTime,
                windowMs: exist.windowMs,
                blockExpiresAt: Date.now() + this.blockDuration,
            });
            res.status(this.statusCode).json({ message: `${this.errormessage}` });
            return true;
        }
        return false;
    }
    createGuard(req, res, next) {
        const ipAddress = req.ip;
        const exist = this.store.getIp(ipAddress);
        // If the IP is already present, increment the request count
        if (this.checkIpExist(res, exist, ipAddress)) {
            return;
        }
        // If the IP doesn't exist, create a new entry
        if (!exist) {
            this.store.setIp(ipAddress, {
                maxRequests: this.maxRequests,
                requestCount: 1,
                firstRequestTime: Date.now(),
                windowMs: Date.now() + this.windowMs,
            });
            return next();
        }
        // Reset if window expired
        if (exist && Date.now() > exist.windowMs) {
            this.store.resetIp(ipAddress, {
                requestCount: 0,
                firstRequestTime: Date.now(),
                windowMs: this.windowMs,
            });
            return next();
        }
        // Check rate limit
        if (this.checkIpLimit(res, exist, ipAddress)) {
            return;
        }
        // If passed all checks
        if (this.headers) {
            res.setHeader('X-RateLimit-Limit', this.maxRequests);
            res.setHeader('X-RateLimit-Remaining', Math.max(this.maxRequests - exist.requestCount, 0));
        }
        next();
    }
}
// export { BruteGuard };
// const bruteGuard = new BruteGuard();
// export default bruteGuard;
exports.default = BruteGuard;

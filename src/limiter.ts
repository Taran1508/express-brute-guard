import memoryStore from './stores/memoryStore';

interface Metrics {
  maxRequests?: number;
  windowMs?: number;
  blockDuration?: number;
  resetTime?: number;
  statusCode?: number;
  errormessage?: string;
  store?: any;
  headers?: boolean;
  // requestCount?: number;
  // firstRequestTime?: number;
}

export class BruteGuard {
  maxRequests: number;
  windowMs: number;
  blockDuration: number;
  resetTime?: number;
  statusCode: number;
  errormessage: string;
  store?: any;
  headers: boolean;
  // requestCount: number;
  // firstRequestTime: number;

  constructor(options: Metrics = {}) {
    this.maxRequests = options.maxRequests || 10;
    // this.requestCount = options.requestCount || 0;
    // this.firstRequestTime = options.firstRequestTime || 0;
    this.windowMs = options.windowMs || 5 * 60 * 1000;
    this.blockDuration = options.blockDuration || 3 * 60 * 1000;
    this.resetTime = options.resetTime || Date.now() + this.windowMs;
    this.statusCode = options.statusCode || 429;
    this.errormessage = options.errormessage || 'Too many Requests';
    this.store = options.store || new memoryStore();
    this.headers = options.headers !== false;
  }

  private isBlocked(res: any, exist: any): boolean {
    if (exist.blockExpiresAt && Date.now() < exist.blockExpiresAt) {
      this.blockDuration = exist.blockExpiresAt;
      if (this.headers) {
        //Enable console.logs for detailed flow while testing
        // console.log('isBlocked X-RateLimit-Reset', this.resetTime);
        // console.log('isBlocked Retry-After', this.blockDuration);
        res.setHeader('Retry-After', this.blockDuration);
      }
      res.status(this.statusCode).json({ message: `${this.errormessage}` });
      return true;
    }
    return false;
  }
  private incrementRequest(res: any, exist: any, ipAddress: string): boolean {
    if (exist?.requestCount >= this.maxRequests) {
      if (this.headers) {
        //Enable console.logs for detailed flow while testing
        // console.log('incrementRequest X-RateLimit-Reset', this.resetTime);
        // console.log('incrementRequest Retry-After', this.blockDuration);
        res.setHeader('X-RateLimit-Reset', this.resetTime);
        res.setHeader('Retry-After', this.blockDuration);
      }
      this.store.updateIp(
        ipAddress,
        exist.requestCount,
        exist.firstRequestTime,
        exist.windowMs,
        Date.now() + this.blockDuration
      );
      res.status(this.statusCode).json({ message: `${this.errormessage}` });
      return true;
    }
    exist.requestCount++;
    //Enable console.logs for detailed flow while testing
    // console.log('[Increment] requestCount:', exist.requestCount);
    this.store.updateIp(
      ipAddress,
      exist.requestCount,
      exist.firstRequestTime,
      exist.windowMs,
      null
    );

    return false;
  }

  // If the IP is already present, increment the request count
  private checkIpExist(res: any, exist: any, ipAddress: string): boolean {
    if (exist && this.isBlocked(res, exist)) return true;
    if (exist && this.incrementRequest(res, exist, ipAddress)) return true;
    return false;
  }

  createGuard(req: any, res: any, next: any) {
    const ipAddress = req.ip;
    const exist = this.store.getIp(ipAddress);

    // If the IP is already present, increment the request count
    if (this.checkIpExist(res, exist, ipAddress)) {
      //Enable console.logs for detailed flow while testing
      //console.log('[Guard] Blocked IP – no next()');
      return;
    }

    // If the IP doesn't exist, create a new entry
    if (!exist) {
      //Enable console.logs for detailed flow while testing
      //console.log('[Guard] New IP – calling next()');
      this.store.setIp(
        ipAddress,
        this.maxRequests,
        1,
        Date.now(),
        Date.now() + this.windowMs
      );
      if (this.headers) {
        //Enable console.logs for detailed flow while testing
        // console.log('Setting headers:', this.maxRequests, this.maxRequests - 1);
        // console.log('X-RateLimit-Limit', this.maxRequests);
        // console.log('X-RateLimit-Remaining', this.maxRequests - 1);
        res.setHeader('X-RateLimit-Limit', this.maxRequests);
        res.setHeader('X-RateLimit-Remaining', this.maxRequests - 1);
      }
      //console.log('New IP [Increment] requestCount:', 1);
      return next();
    }

    // Reset if window expired
    if (Date.now() > exist.windowMs) {
      //Enable console.logs for detailed flow while testing
      //console.log('[Guard] Window expired –reset - calling next()');
      this.store.resetIp(ipAddress, 0, Date.now(), this.windowMs, null);
      return next();
    }

    // If passed all checks
    if (this.headers) {
      //Enable console.logs for detailed flow while testing
      // console.log(
      //   'Setting headers - final:',
      //   this.maxRequests,
      //   this.maxRequests - (exist?.requestCount || 0)
      // );
      // console.log(
      //   'If passed all checks' + 'X-RateLimit-Limit',
      //   this.maxRequests
      // );
      // console.log(
      //   'If passed all checks' + 'X-RateLimit-Remaining',
      //   this.maxRequests - (exist?.requestCount || 0)
      // );

      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader(
        'X-RateLimit-Remaining',
        this.maxRequests - (exist?.requestCount || 0)
      );
    }

    //Enable console.logs for detailed flow while testing
    //console.log('[Guard] Final fallback next()');
    next();
  }
}

const bruteGuard = new BruteGuard();
export default bruteGuard;

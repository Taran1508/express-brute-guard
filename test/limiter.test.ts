import { describe, expect, test } from '@jest/globals';
import bruteGuard, { BruteGuard } from '../src/limiter';
import memoryStore from '../src/stores/memoryStore';
import express from 'express';
import request from 'supertest';

describe('BruteGuard Check', () => {
  let store: memoryStore;
  let guard: BruteGuard;
  let req: any, res: any, next: jest.Mock;

  beforeEach(() => {
    store = new memoryStore();
    guard = new BruteGuard({
      maxRequests: 2,
      windowMs: 5000,
      store,
      headers: true,
    });

    req = { ip: '127.0.0.1' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    next = jest.fn();
  });
  test('should return ip address when called req.ip', () => {
    guard.createGuard(req, res, next);
    expect(req.ip).toBe('127.0.0.1');
  });
  test('should allow first-time IP requests', () => {
    guard.createGuard(req, res, next);
    expect(res.json).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  test('should block limit-exceeded IP requests', () => {
    // simulate 3 requests from the same IP
    guard.createGuard(req, res, next); // 1st request - should pass
    guard.createGuard(req, res, next); // 2nd request - should pass
    guard.createGuard(req, res, next); // 3rd request - should block

    expect(next).toHaveBeenCalledTimes(2); // only first two allowed
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ message: 'Too many Requests' });
  });

  test('should reset request count after windowMs expires', () => {
    jest.useFakeTimers();
    const guard = new BruteGuard({ maxRequests: 3, windowMs: 1000 });
    const req = { ip: '127.0.0.3' } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    const next = jest.fn();
    guard.createGuard(req, res, next);
    guard.createGuard(req, res, next);

    jest.advanceTimersByTime(1001);

    guard.createGuard(req, res, next);

    expect(next).toHaveBeenCalledTimes(3);
    jest.useRealTimers();
  });

  test('should block after max requests - real api hits', async () => {
    const app = express();
    const guard = new BruteGuard({ maxRequests: 2, windowMs: 1000 });
    app.use((req, res, next) => guard.createGuard(req, res, next));
    app.get('/', (req, res: any) => res.send('ok'));

    await request(app).get('/');
    await request(app).get('/');
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(429);
  });

  test('should send proper headers when enabled', () => {
    let store: memoryStore;
    store = new memoryStore();
    const guard = new BruteGuard({
      maxRequests: 2,
      windowMs: 1000,
      store,
      headers: true,
    });

    const req = { ip: '127.0.0.1' } as any;
    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    // Simulate the first request (within the limit)
    guard.createGuard(req, res, next);

    // First request should set X-RateLimit-Limit and X-RateLimit-Remaining headers
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 2);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 1);

    // Simulate the second request (within the limit)
    guard.createGuard(req, res, next);

    // Second request should still set X-RateLimit-Limit and X-RateLimit-Remaining headers
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 2);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 0);

    // Simulate the third request (exceeding the limit)
    guard.createGuard(req, res, next);

    //set headers for the third request, as it's blocked due to rate limit exceeded
    expect(res.setHeader).toHaveBeenCalledTimes(6); // 2 headers per first two requests
    expect(res.status).toHaveBeenCalledWith(429); // Blocked status code
  });

  test('should return correct block duration and reset time in headers', () => {
    jest.useFakeTimers();
    const req = { ip: '127.0.0.1' } as any;
    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    const guard = new BruteGuard({
      maxRequests: 2,
      windowMs: 1000,
      blockDuration: 3000,
      resetTime: 4000,
      store,
      headers: true,
    });
    guard.createGuard(req, res, next);
    guard.createGuard(req, res, next);
    guard.createGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ message: 'Too many Requests' });
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', 4000);
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', 3000);

    jest.useRealTimers();
  });

  test('should not block if block duration has expired', () => {
    jest.useFakeTimers();
    let store: memoryStore;
    store = new memoryStore();
    const req = { ip: '127.0.0.1' } as any;
    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    const guard = new BruteGuard({
      maxRequests: 2,
      windowMs: 3000,
      blockDuration: 2000,
      resetTime: 4000,
      store,
      headers: true,
    });

    guard.createGuard(req, res, next);
    guard.createGuard(req, res, next);
    guard.createGuard(req, res, next);

    jest.advanceTimersByTime(3010);

    guard.createGuard(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 1);
    //expect(res.status).not.toHaveBeenCalledWith(429);
    expect(next).toHaveBeenCalled();

    jest.useRealTimers();
  });

  test('should handle multiple IPs independently', () => {
    const store = new memoryStore();

    const res1 = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const res2 = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next1 = jest.fn();
    const next2 = jest.fn();

    const req1 = { ip: '10.0.0.1' } as any;
    const req2 = { ip: '10.0.0.2' } as any;

    const guard = new BruteGuard({
      maxRequests: 1,
      windowMs: 5000,
      blockDuration: 2000,
      resetTime: 5000,
      store,
      headers: true,
    });

    // First IP hits limit
    guard.createGuard(req1, res1, next1);
    guard.createGuard(req1, res1, next1); // Blocked

    // Second IP should still be allowed
    guard.createGuard(req2, res2, next2); // Allowed

    expect(res1.status).toHaveBeenCalledWith(429);
    expect(res2.status).not.toHaveBeenCalled(); // Not blocked
    expect(next2).toHaveBeenCalled(); // Proceeds
  });

  test('should block burst requests exceeding limit within windowMs', () => {
    jest.useFakeTimers();
    const store = new memoryStore();
    const req = { ip: '192.168.0.1' } as any;
    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    const guard = new BruteGuard({
      maxRequests: 3,
      windowMs: 5000,
      blockDuration: 3000,
      resetTime: 5000,
      store,
      headers: true,
    });

    // Simulate burst requests
    guard.createGuard(req, res, next); // 1
    guard.createGuard(req, res, next); // 2
    guard.createGuard(req, res, next); // 3
    guard.createGuard(req, res, next); // 4 — Should be blocked

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ message: 'Too many Requests' });

    jest.useRealTimers();
  });
});

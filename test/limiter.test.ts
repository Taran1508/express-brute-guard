import { describe, expect, test } from '@jest/globals';
import bruteGuard, { BruteGuard } from '../src/limiter';

const guard = new BruteGuard({ maxRequests: 2, windowMs: 1000 });
const req = { ip: '127.0.0.3' }; // simulate the ip request
const res: any = {
  setHeader: jest.fn(), // Mock setHeader to check if headers are set
  status: jest.fn(() => res), // Chainable mock for status
  json: jest.fn(), // Mock json method
};
const next = jest.fn();

describe('BruteGuard Check', () => {
  test('should return ip address when called req.ip', () => {
    guard.createGuard(req, res, next);
    expect(req.ip).toBe('127.0.0.3');
  });

  test('should allow first-time IP requests', () => {
    guard.createGuard(req, res, next);
    expect(res.json).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});

test('should allow first-time IP requests', () => {
  guard.createGuard(req, res, next);
  expect(res.json).not.toHaveBeenCalled();
  expect(res.status).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalled();
});

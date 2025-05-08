import { describe, expect, test } from '@jest/globals';
import memoryStore from '../src/stores/memoryStore';

describe('MemoryMap Check', () => {
  const memoryMap = new memoryStore();

  let ipAddress = '127.0.0.1';
  let maxRequests = 2;
  let requestCount = 1;
  let firstRequestTime = 5000;
  let windowMs = firstRequestTime + 1000;
  let blockExpiresAt = 1000;

  test('should set a new IP entry with correct values', () => {
    memoryMap.setIp(
      ipAddress,
      maxRequests,
      requestCount,
      firstRequestTime,
      windowMs
    );

    expect(memoryMap.getIp(ipAddress)).toEqual({
      maxRequests: 2,
      requestCount: 1,
      firstRequestTime: 5000,
      windowMs: 6000,
    });
  });

  test('should get IP data correctly', () => {
    memoryMap.setIp(
      ipAddress,
      maxRequests,
      requestCount,
      firstRequestTime,
      windowMs
    );

    expect(memoryMap.getIp(ipAddress)).toEqual({
      maxRequests: 2,
      requestCount: 1,
      firstRequestTime: 5000,
      windowMs: 6000,
    });
  });

  test('should update existing IP data', () => {
    let ipAddress = '127.0.0.1';
    let maxRequests = 2;
    let requestCount = 1;
    let firstRequestTime = 5000;
    let windowMs = firstRequestTime + 1000;
    let blockExpiresAt = 1000;

    memoryMap.updateIp(
      ipAddress,
      requestCount,
      maxRequests,
      firstRequestTime,
      windowMs,
      blockExpiresAt
    );

    expect(memoryMap.getIp(ipAddress)).toEqual({
      requestCount: 1,
      maxRequests: 2,
      firstRequestTime: 5000,
      windowMs: 6000,
      blockExpiresAt: 1000,
    });
  });

  test('should reset an IP’s rate limit data', () => {
    let requestCount = 1;
    memoryMap.setIp(
      ipAddress,
      maxRequests,
      requestCount,
      firstRequestTime,
      windowMs
    );

    memoryMap.resetIp(ipAddress, 0, firstRequestTime, windowMs, blockExpiresAt);
  });

  test('should delete IP data correctly', () => {
    memoryMap.setIp(
      ipAddress,
      maxRequests,
      requestCount,
      firstRequestTime,
      windowMs
    );

    expect(memoryMap.deleteIp(ipAddress)).toBe(`IP Data deleted: ${ipAddress}`);
  });
});

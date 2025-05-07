"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const limiter_1 = __importDefault(require("../src/limiter"));
console.log(limiter_1.default);
(0, globals_1.describe)('BruteGuard Check', () => {
    const guard = new limiter_1.default({ maxRequests: 2, windowMs: 1000 });
    const req = { ip: '127.0.0.1' }; // simulate the ip request
    const res = {
        setHeader: jest.fn(), // Mock setHeader to check if headers are set
        status: jest.fn(() => res), // Chainable mock for status
        json: jest.fn(), // Mock json method
    };
    const next = jest.fn();
    (0, globals_1.test)('should return ip address when called req.ip', () => {
        guard.createGuard(req, res, next);
        console.log(req.ip);
    });
    (0, globals_1.test)('should allow first-time IP requests', () => { });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    // preset: 'ts-jest',
    testMatch: ['**/test/**/*.test.ts', '**/test/*.test.ts'],
};
exports.default = config;

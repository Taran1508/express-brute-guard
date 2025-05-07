/** @type {import('ts-jest').JestConfigWithTsJest} **/
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  // preset: 'ts-jest',
  testMatch: ['**/test/**/*.test.ts', '**/test/*.test.ts'],
};

export default config;

import { base } from './jest.config.js';

export default {
  ...base,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/core/boilerplate/__tests__/*.test.ts'],
};

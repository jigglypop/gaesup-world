import { base } from './jest.config.js';

export default {
  ...base,
  testEnvironment: 'node',
  // A root path instead of a `<rootDir>` glob: on Windows a checkout under a dot folder (`C:\x\.wt\...`) turns into a
  // glob whose `\.` escapes the dot, and nothing matches.
  roots: ['<rootDir>/src/core/boilerplate/__tests__'],
  testMatch: ['**/*.test.ts'],
};

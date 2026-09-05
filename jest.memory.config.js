import baseConfig from './jest.config.js';

export default {
  ...baseConfig,
  testMatch: [
    '<rootDir>/src/core/boilerplate/__tests__/AbstractBridge.test.ts',
    '<rootDir>/src/core/boilerplate/__tests__/ManagedEntity.test.ts',
    '<rootDir>/src/core/boilerplate/decorators/__tests__/bridge.test.ts',
    '<rootDir>/src/core/boilerplate/hooks/__tests__/useManagedEntity.test.ts',
    '<rootDir>/src/core/boilerplate/hooks/__tests__/useBatchManagedEntities.test.ts',
  ],
};

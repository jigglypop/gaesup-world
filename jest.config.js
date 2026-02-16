export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@hooks/(.*)$': '<rootDir>/src/core/hooks/$1',
    '^@stores/(.*)$': '<rootDir>/src/core/stores/$1',
    '^@components/(.*)$': '<rootDir>/src/core/components/$1',
    '^@constants/(.*)$': '<rootDir>/src/core/constants/$1',
    '^@utils/(.*)$': '<rootDir>/src/core/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/core/types/$1',
    '^@motions/(.*)$': '<rootDir>/src/core/motions/$1',
    '^@debug/(.*)$': '<rootDir>/src/core/debug/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(three|@react-three|three-stdlib|@react-spring|@use-gesture|react-use-refs|zustand|jotai|leva|@react-icons|react-device-detect|mitt)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/index.ts',
  ],
  setupFiles: ['jest-canvas-mock'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
}; 
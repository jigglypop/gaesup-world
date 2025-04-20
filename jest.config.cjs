module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.cjs',
    '^three$': require.resolve('three'),
    '^@react-three/fiber$': require.resolve('@react-three/fiber'),
    '^@react-three/drei$': require.resolve('@react-three/drei'),
    '^@react-three/rapier$': require.resolve('@react-three/rapier'),
    '^@react-three/test-renderer$': require.resolve('@react-three/test-renderer'),
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.cjs'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transformIgnorePatterns: ['/node_modules/(?!three|@react-three|@dimforge|troika-three-text)'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};

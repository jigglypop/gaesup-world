/** Options shared by every project and by jest.memory.config.js. */
export const base = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '^gaesup-world$': '<rootDir>/src/index.ts',
    '^gaesup-world/admin$': '<rootDir>/src/admin-entry.ts',
    '^gaesup-world/assets$': '<rootDir>/src/assets.ts',
    '^gaesup-world/avatar$': '<rootDir>/src/avatar.ts',
    '^gaesup-world/blueprints$': '<rootDir>/src/blueprints/index.ts',
    '^gaesup-world/blueprints/editor$': '<rootDir>/src/blueprints/editor.ts',
    '^gaesup-world/building$': '<rootDir>/src/building.ts',
    '^gaesup-world/editor$': '<rootDir>/src/editor.ts',
    '^gaesup-world/gameplay$': '<rootDir>/src/gameplay.ts',
    '^gaesup-world/navigation$': '<rootDir>/src/navigation.ts',
    '^gaesup-world/network$': '<rootDir>/src/network.ts',
    '^gaesup-world/next$': '<rootDir>/src/next.ts',
    '^gaesup-world/postprocessing$': '<rootDir>/src/postprocessing.ts',
    '^gaesup-world/plugins$': '<rootDir>/src/plugins.ts',
    '^gaesup-world/runtime$': '<rootDir>/src/runtime.ts',
    '^gaesup-world/server-contracts$': '<rootDir>/src/server-contracts.ts',
    '^@react-three/postprocessing$': '<rootDir>/test/mocks/reactThreePostprocessing.tsx',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@hooks/(.*)$': '<rootDir>/src/core/hooks/$1',
    '^@stores/(.*)$': '<rootDir>/src/core/stores/$1',
    '^@constants/(.*)$': '<rootDir>/src/core/constants/$1',
    '^@utils/(.*)$': '<rootDir>/src/core/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/core/types/$1',
    '^@motions/(.*)$': '<rootDir>/src/core/motions/$1',
    '\\.(glsl|vert|frag|wasm|glb)$': '<rootDir>/test/mocks/assetModule.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.m?js$': ['ts-jest', { tsconfig: { allowJs: true, checkJs: false, module: 'CommonJS' }, diagnostics: false }],
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm|three|@react-three|three-stdlib|@react-spring|@use-gesture|react-use-refs|zustand|mitt)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '<rootDir>/.claude/'],
  // Agent worktrees live under .claude/ and carry their own package.json; keep them out of the module map.
  modulePathIgnorePatterns: ['<rootDir>/.claude/'],
  // A no-op without a DOM, so node tests that opt into jsdom still get a canvas.
  setupFiles: ['jest-canvas-mock'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

export default {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/index.ts',
  ],
  projects: [
    // Logic tests skip jsdom setup. A .test.ts that needs a DOM starts with `/** @jest-environment jsdom */`, as does
    // one whose code checks prototypes of structuredClone results: jest's node realm gets the host's clones.
    {
      ...base,
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['**/*.test.ts'],
      testPathIgnorePatterns: [...base.testPathIgnorePatterns, '/src/__tests__/'],
    },
    { ...base, displayName: 'dom', testEnvironment: 'jsdom', testMatch: ['**/*.test.tsx'] },
    // Package, export and public API contracts.
    { ...base, displayName: 'package', testEnvironment: 'node', testMatch: ['**/src/__tests__/**/*.test.ts'] },
  ],
};

import { readFileSync } from 'node:fs';

// tsconfig `paths` is the only alias list; Vite reads it through resolve.tsconfigPaths.
const { paths } = JSON.parse(readFileSync(new URL('./tsconfig.json', import.meta.url), 'utf8')).compilerOptions;
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pathAliases = Object.fromEntries(
  Object.entries(paths).map(([alias, [target]]) => [
    `^${escapeRegExp(alias).replace('\\*', '(.*)')}$`,
    `<rootDir>/${target.replace(/^\.\//, '').replace('*', '$1')}`,
  ]),
);

/** Options shared by every project and by jest.memory.config.js. */
export const base = {
  preset: 'ts-jest',
  // Asset and style stubs come first so an aliased .css or .glsl import never loads the raw file.
  moduleNameMapper: {
    '\\.(glsl|vert|frag|wasm|glb)$': '<rootDir>/test/mocks/assetModule.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@react-three/postprocessing$': '<rootDir>/test/mocks/reactThreePostprocessing.tsx',
    ...pathAliases,
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

// @ts-check

import pluginImport from 'eslint-plugin-import';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Raw useFrame owners outside the scheduler; check:quality caps their count (rawUseFrame).
const RAW_USE_FRAME_OWNERS = [
  'src/core/runtime/frame/react/**',
  'src/core/rendering/GpuBatchBridge.tsx',
  'src/core/rendering/postprocess/WorldPostProcessing.tsx',
];

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/demo-dist/**',
      '**/public/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.tmp/**',
      '.artifacts/**',
      '.claude/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      import: pluginImport,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react/no-unknown-property': [
        'error',
        {
          ignore: [
            // react-three-fiber props
            'args',
            'matrixAutoUpdate',
            'attach',
            'blending',
            'castShadow',
            'colorWrite',
            'decay',
            'dispose',
            'depthWrite',
            'distance',
            'emissive',
            'emissiveIntensity',
            'envMapIntensity',
            'frustumCulled',
            'geometry',
            'gradientMap',
            'groundColor',
            'index',
            'instanceCount',
            'intensity',
            'map',
            'alphaMap',
            'material',
            'metalness',
            'object',
            'polygonOffset',
            'polygonOffsetFactor',
            'polygonOffsetUnits',
            'position',
            'receiveShadow',
            'raycast',
            'renderOrder',
            'rotation',
            'rotation-x',
            'rotation-y',
            'roughness',
            'shadow-bias',
            'shadow-camera-bottom',
            'shadow-camera-far',
            'shadow-camera-left',
            'shadow-camera-near',
            'shadow-camera-right',
            'shadow-camera-top',
            'shadow-mapSize',
            'shadow-normalBias',
            'side',
            'sizeAttenuation',
            'skeleton',
            'transmission',
            'toneMapped',
            'transparent',
            'userData',
            'vertexColors',
            'visible',
            'windStrength',
            'attributes-position',
            'attributes-uv',
            'attributes-normal',
            'lights',
          ],
        },
      ],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-relative-parent-imports': 'off',
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: RAW_USE_FRAME_OWNERS,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@react-three/fiber',
              importNames: ['useFrame'],
              message: 'Use useEngineFrame or useSharedFrame from runtime/frame instead of raw useFrame.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/core/**/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: 'Layer 1(core) cannot import React' },
            { name: 'zustand', message: 'Layer 1(core) cannot import Zustand' },
            {
              name: '@react-three/fiber',
              message: 'Layer 1(core) cannot import React Three Fiber',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/blueprints/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['scripts/**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', 'test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      // Tests drive core modules through React/R3F harnesses.
      'no-restricted-imports': 'off',
    },
  },
);

// @ts-check

import pluginImport from 'eslint-plugin-import';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/demo-dist/**',
      '**/public/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.tmp/**',
      '**/__tests__/**',
      '**/*.test.*',
      '**/*.spec.*',
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
);

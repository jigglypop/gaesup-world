import path from 'path';

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const libraryExternals = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'three',
  /^three\//,
  'three-stdlib',
  '@react-three/fiber',
  '@react-three/drei',
  '@react-three/rapier',
  '@react-three/postprocessing',
  '@dimforge/rapier3d',
  '@dimforge/rapier3d-compat',
  'immer',
  /^immer\//,
  'mitt',
  'react-icons',
  /^react-icons\//,
  'react-router-dom',
  'reactflow',
  'reflect-metadata',
  'simplex-noise',
  'zustand',
  /^zustand\//,
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isLibraryBuild = mode === 'esm' || mode === 'cjs';

  const alias = [
    { find: '@', replacement: path.resolve(__dirname, 'src') },
    { find: '@core', replacement: path.resolve(__dirname, 'src/core') },
    { find: '@hooks', replacement: path.resolve(__dirname, 'src/core/hooks') },
    { find: '@stores', replacement: path.resolve(__dirname, 'src/core/stores') },
    { find: '@world', replacement: path.resolve(__dirname, 'src/core/world') },
    { find: '@interactions', replacement: path.resolve(__dirname, 'src/core/interactions') },
    { find: '@ui', replacement: path.resolve(__dirname, 'src/core/ui') },
    { find: '@constants', replacement: path.resolve(__dirname, 'src/core/constants') },
    { find: '@utils', replacement: path.resolve(__dirname, 'src/core/utils') },
    { find: '@motions', replacement: path.resolve(__dirname, 'src/core/motions') },
    { find: '@debug', replacement: path.resolve(__dirname, 'src/core/debug') },
  ];
  if (isLibraryBuild) {
    return {
      plugins: [
        react({
          parserConfig: (id) => {
            // Enable decorators for all TypeScript files
            if (id.endsWith('.ts') || id.endsWith('.tsx')) {
              return {
                syntax: 'typescript',
                tsx: id.endsWith('.tsx'),
                decorators: true,
              };
            }
          },
          tsDecorators: true,
        }),
        tsconfigPaths(),
        svgr(),
        glsl()
      ],
      resolve: {
        alias,
      },
      build: {
        lib: {
          entry: {
            index: path.resolve(__dirname, 'src/index.ts'),
            admin: path.resolve(__dirname, 'src/admin-entry.ts'),
            blueprints: path.resolve(__dirname, 'src/blueprints/index.ts'),
            'blueprints-editor': path.resolve(__dirname, 'src/blueprints/editor.ts'),
            postprocessing: path.resolve(__dirname, 'src/postprocessing.ts'),
          },
          name: 'GaesupWorld',
          fileName: (format, entryName) => `${entryName}.${format === 'cjs' ? 'cjs' : 'js'}`,
          cssFileName: 'index',
          formats: mode === 'esm' ? ['es'] : ['cjs'],
        },
        rollupOptions: {
          external: libraryExternals,
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              three: 'THREE',
            },
          },
        },
        outDir: mode === 'esm' ? 'dist' : 'dist',
        emptyOutDir: false,
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
        // Avoid `process is not defined` in browsers for any dev-only diagnostics.
        'process.env.VITE_ENABLE_BRIDGE_LOGS': JSON.stringify(process.env.VITE_ENABLE_BRIDGE_LOGS ?? ''),
      },
    };
  }
  return {
    plugins: [
      react({
        parserConfig: (id) => {
          // Enable decorators for all TypeScript files
          if (id.endsWith('.ts') || id.endsWith('.tsx')) {
            return {
              syntax: 'typescript',
              tsx: id.endsWith('.tsx'),
              decorators: true,
            };
          }
        },
        tsDecorators: true,
      }),
      tsconfigPaths(),
      svgr(),
      glsl()
    ],
    resolve: {
      alias,
      dedupe: ['react', 'react-dom'],
    },
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'demo-dist',
      sourcemap: true,
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
      // Avoid `process is not defined` in browsers for any dev-only diagnostics.
      'process.env.VITE_ENABLE_BRIDGE_LOGS': JSON.stringify(process.env.VITE_ENABLE_BRIDGE_LOGS ?? ''),
    },
  };
});

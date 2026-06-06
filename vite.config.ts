import { createReadStream, existsSync } from 'fs';
import type { IncomingMessage, ServerResponse } from 'http';
import path from 'path';

import react from '@vitejs/plugin-react-swc';
import type { Plugin, ViteDevServer } from 'vite';
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
  'reflect-metadata',
  'simplex-noise',
  'zustand',
  /^zustand\//,
];

const GLTF_CONTENT_TYPES: Record<string, string> = {
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
};

function demoManualChunks(id: string): string | undefined {
  if (id.includes('node_modules')) {
    if (id.includes('@dimforge') || id.includes('@react-three/rapier')) return 'vendor-physics';
    if (id.includes('@react-three')) return 'vendor-r3f';
    if (id.includes('three')) return 'vendor-three';
    if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
    return 'vendor';
  }

  const normalized = id.replace(/\\/g, '/');
  if (normalized.includes('/src/core/building/')) return 'gaesup-building';
  if (normalized.includes('/src/core/editor/')) return 'gaesup-editor';
  if (normalized.includes('/src/core/networks/')) return 'gaesup-network';
  if (normalized.includes('/src/core/motions/')) return 'gaesup-motions';
  if (normalized.includes('/src/core/camera/')) return 'gaesup-camera';
  if (normalized.includes('/src/core/plugins/') || normalized.includes('/src/core/runtime/')) return 'gaesup-runtime';
  return undefined;
}

function serveDemoGltfAssets(): Plugin {
  return {
    name: 'serve-demo-gltf-assets',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const pathname = req.url?.split('?')[0] ?? '';
        if (!pathname.startsWith('/gltf/')) {
          next();
          return;
        }

        const relativePath = decodeURIComponent(pathname.replace(/^\/gltf\//, ''));
        const assetPath = path.resolve(__dirname, 'demo-dist/gltf', relativePath);
        const assetRoot = path.resolve(__dirname, 'demo-dist/gltf');
        if (!assetPath.startsWith(assetRoot) || !existsSync(assetPath)) {
          next();
          return;
        }

        res.setHeader('Content-Type', GLTF_CONTENT_TYPES[path.extname(assetPath)] ?? 'application/octet-stream');
        createReadStream(assetPath).pipe(res);
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isLibraryBuild = mode === 'esm' || mode === 'cjs';

  const alias = [
    { find: /^gaesup-world$/, replacement: path.resolve(__dirname, 'src/index.ts') },
    { find: /^gaesup-world\/admin$/, replacement: path.resolve(__dirname, 'src/admin-entry.ts') },
    { find: /^gaesup-world\/assets$/, replacement: path.resolve(__dirname, 'src/assets.ts') },
    { find: /^gaesup-world\/blueprints$/, replacement: path.resolve(__dirname, 'src/blueprints/index.ts') },
    { find: /^gaesup-world\/blueprints\/editor$/, replacement: path.resolve(__dirname, 'src/blueprints/editor.ts') },
    { find: /^gaesup-world\/building$/, replacement: path.resolve(__dirname, 'src/building.ts') },
    { find: /^gaesup-world\/editor$/, replacement: path.resolve(__dirname, 'src/editor.ts') },
    { find: /^gaesup-world\/gameplay$/, replacement: path.resolve(__dirname, 'src/gameplay.ts') },
    { find: /^gaesup-world\/navigation$/, replacement: path.resolve(__dirname, 'src/navigation.ts') },
    { find: /^gaesup-world\/network$/, replacement: path.resolve(__dirname, 'src/network.ts') },
    { find: /^gaesup-world\/postprocessing$/, replacement: path.resolve(__dirname, 'src/postprocessing.ts') },
    { find: /^gaesup-world\/plugins$/, replacement: path.resolve(__dirname, 'src/plugins.ts') },
    { find: /^gaesup-world\/runtime$/, replacement: path.resolve(__dirname, 'src/runtime.ts') },
    { find: /^gaesup-world\/server-contracts$/, replacement: path.resolve(__dirname, 'src/server-contracts.ts') },
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
            return undefined;
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
            assets: path.resolve(__dirname, 'src/assets.ts'),
            blueprints: path.resolve(__dirname, 'src/blueprints/index.ts'),
            'blueprints-editor': path.resolve(__dirname, 'src/blueprints/editor.ts'),
            building: path.resolve(__dirname, 'src/building.ts'),
            editor: path.resolve(__dirname, 'src/editor.ts'),
            gameplay: path.resolve(__dirname, 'src/gameplay.ts'),
            navigation: path.resolve(__dirname, 'src/navigation.ts'),
            network: path.resolve(__dirname, 'src/network.ts'),
            plugins: path.resolve(__dirname, 'src/plugins.ts'),
            postprocessing: path.resolve(__dirname, 'src/postprocessing.ts'),
            runtime: path.resolve(__dirname, 'src/runtime.ts'),
            'server-contracts': path.resolve(__dirname, 'src/server-contracts.ts'),
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
          return undefined;
        },
        tsDecorators: true,
      }),
      tsconfigPaths(),
      svgr(),
      glsl(),
      serveDemoGltfAssets()
    ],
    resolve: {
      alias,
      dedupe: ['react', 'react-dom'],
    },
    server: {
      host: '127.0.0.1',
      port: 5174,
      open: true,
    },
    build: {
      outDir: 'demo-dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: demoManualChunks,
        },
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
      // Avoid `process is not defined` in browsers for any dev-only diagnostics.
      'process.env.VITE_ENABLE_BRIDGE_LOGS': JSON.stringify(process.env.VITE_ENABLE_BRIDGE_LOGS ?? ''),
    },
  };
});

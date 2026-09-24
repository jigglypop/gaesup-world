import { createReadStream, existsSync, readFileSync } from 'fs';
import type { IncomingMessage, ServerResponse } from 'http';
import path from 'path';

import react from '@vitejs/plugin-react-swc';
import type { Plugin, ViteDevServer } from 'vite';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import svgr from 'vite-plugin-svgr';

import { minihomeRoomPlugin } from './scripts/minihome-room-service.mjs';
import { performanceIdentityPlugin } from './scripts/performance/vite-plugin.mjs';

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
  '@xyflow/react',
  'immer',
  /^immer\//,
  'mitt',
  'reflect-metadata',
  'simplex-noise',
  'zustand',
  /^zustand\//,
];

const GLTF_CONTENT_TYPES: Record<string, string> = {
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
};

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
        const assetPath = path.resolve(import.meta.dirname, 'demo-dist/gltf', relativePath);
        const assetRoot = path.resolve(import.meta.dirname, 'demo-dist/gltf');
        if (!assetPath.startsWith(assetRoot) || !existsSync(assetPath)) {
          next();
          return;
        }

        res.setHeader(
          'Content-Type',
          GLTF_CONTENT_TYPES[path.extname(assetPath)] ?? 'application/octet-stream',
        );
        createReadStream(assetPath).pipe(res);
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isLibraryBuild = mode === 'esm' || mode === 'cjs';

  // Source aliases, gaesup-world subpaths included, come from tsconfig `paths` via resolve.tsconfigPaths.
  // A published-consumer build maps the subpaths to that install instead; aliases resolve before tsconfig paths.
  let alias: { find: RegExp; replacement: string }[] = [];
  if (!isLibraryBuild && process.env['GAESUP_PACKAGE_ROOT']) {
    const packageRoot = path.resolve(process.env['GAESUP_PACKAGE_ROOT']);
    const published = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
    alias = Object.entries(published.exports as Record<string, string | { import: { default: string } }>).map(([subpath, value]) => ({
      find: new RegExp(`^${(subpath === '.' ? 'gaesup-world' : `gaesup-world/${subpath.slice(2)}`).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
      replacement: path.resolve(packageRoot, typeof value === 'string' ? value : value.import.default),
    }));
  }
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
        svgr(),
        glsl(),
      ],
      resolve: {
        tsconfigPaths: true,
      },
      build: {
        lib: {
          entry: {
            avatar: path.resolve(import.meta.dirname, 'src/avatar.ts'),
            index: path.resolve(import.meta.dirname, 'src/index.ts'),
            admin: path.resolve(import.meta.dirname, 'src/admin-entry.ts'),
            assets: path.resolve(import.meta.dirname, 'src/assets.ts'),
            blueprints: path.resolve(import.meta.dirname, 'src/blueprints/index.ts'),
            'blueprints-editor': path.resolve(import.meta.dirname, 'src/blueprints/editor.ts'),
            building: path.resolve(import.meta.dirname, 'src/building.ts'),
            editor: path.resolve(import.meta.dirname, 'src/editor.ts'),
            gameplay: path.resolve(import.meta.dirname, 'src/gameplay.ts'),
            navigation: path.resolve(import.meta.dirname, 'src/navigation.ts'),
            network: path.resolve(import.meta.dirname, 'src/network.ts'),
            next: path.resolve(import.meta.dirname, 'src/next.ts'),
            plugins: path.resolve(import.meta.dirname, 'src/plugins.ts'),
            postprocessing: path.resolve(import.meta.dirname, 'src/postprocessing.ts'),
            runtime: path.resolve(import.meta.dirname, 'src/runtime.ts'),
            'server-contracts': path.resolve(import.meta.dirname, 'src/server-contracts.ts'),
          },
          name: 'GaesupWorld',
          fileName: (format, entryName) => `${entryName}.${format === 'cjs' ? 'cjs' : 'js'}`,
          cssFileName: 'index',
          formats: mode === 'esm' ? ['es'] : ['cjs'],
        },
        rolldownOptions: {
          external: libraryExternals,
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              three: 'THREE',
            },
          },
        },
        outDir: 'dist',
        emptyOutDir: false,
      },
      define: {
        // NODE_ENV stays for the consumer's bundler; src/core/utils/env.ts tolerates a missing `process`.
        // Avoid `process is not defined` in browsers for any dev-only diagnostics.
        'process.env.VITE_ENABLE_BRIDGE_LOGS': JSON.stringify(
          process.env.VITE_ENABLE_BRIDGE_LOGS ?? '',
        ),
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
      svgr(),
      glsl(),
      serveDemoGltfAssets(),
      performanceIdentityPlugin(),
      minihomeRoomPlugin(),
    ],
    resolve: {
      tsconfigPaths: true,
      alias,
      // Published-consumer builds must share one Three module graph with the example.
      // Duplicate node/lighting registries can render an unlit WebGPU scene without errors.
      dedupe: ['react', 'react-dom', 'three'],
    },
    optimizeDeps: {
      entries: ['index.html', 'examples/engine/packageSurface.ts'],
    },
    server: {
      host: '127.0.0.1',
      port: 5174,
      open: true,
      // Tools that truncate then write a file can be read mid-write; the empty transform is then cached and the
      // importer fails with "does not provide an export". Emit changes only after the size stops changing.
      watch: { awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 } },
    },
    build: {
      outDir: 'demo-dist',
      sourcemap: true,
      rolldownOptions: {
        output: {
          strictExecutionOrder: true,
        },
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
      // Avoid `process is not defined` in browsers for any dev-only diagnostics.
      'process.env.VITE_ENABLE_BRIDGE_LOGS': JSON.stringify(
        process.env.VITE_ENABLE_BRIDGE_LOGS ?? '',
      ),
    },
  };
});

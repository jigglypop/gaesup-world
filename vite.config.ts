import { readFileSync } from 'fs';
import path from 'path';

import react from '@vitejs/plugin-react-swc';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import svgr from 'vite-plugin-svgr';

import { PACKAGE_ENTRIES } from './scripts/lib/packageEntries.cjs';

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
  'simplex-noise',
  'zustand',
  /^zustand\//,
];

/**
 * The package ships only its WASM kernels from `public/` (the core and the GI probe updater); copying the whole folder
 * would put the example's models into `dist`.
 */
const SHIPPED_WASM = ['gaesup_core.wasm', 'gaesup_gi.wasm'];

function emitCoreWasm(): Plugin {
  return {
    name: 'emit-core-wasm',
    generateBundle() {
      for (const name of SHIPPED_WASM) {
        const source = readFileSync(path.resolve(import.meta.dirname, 'public/wasm', name));
        this.emitFile({ type: 'asset', fileName: `wasm/${name}`, source });
      }
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
        react(),
        svgr(),
        glsl(),
        emitCoreWasm(),
      ],
      resolve: {
        tsconfigPaths: true,
      },
      build: {
        lib: {
          entry: Object.fromEntries(PACKAGE_ENTRIES.map(({ name, source }) => [name, path.resolve(import.meta.dirname, source)])),
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
        copyPublicDir: false,
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
      react(),
      svgr(),
      glsl(),
    ],
    resolve: {
      tsconfigPaths: true,
      alias,
      // Published-consumer builds must share one copy of every peer with the example. A second Three splits WebGPU's
      // node/lighting registries (an unlit scene without errors); a second React Three Fiber, Rapier or drei splits
      // their contexts, so the package's hooks throw "Hooks can only be used within the Canvas component!".
      dedupe: Object.keys(
        JSON.parse(readFileSync(path.resolve(import.meta.dirname, 'package.json'), 'utf8')).peerDependencies,
      ),
    },
    optimizeDeps: {
      entries: ['index.html'],
    },
    server: {
      host: '127.0.0.1',
      port: 5174,
      open: true,
      watch: {
        // Tools that truncate then write a file can be read mid-write; the empty transform is then cached and the
        // importer fails with "does not provide an export". Emit changes only after the size stops changing.
        awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
        // Agent worktrees and build output are full copies of the tree. Watching them let a long-running server
        // accumulate tens of thousands of handles and stop answering when worktrees were created and removed.
        ignored: ['**/.claude/**', '**/dist/**', '**/demo-dist/**', '**/.tmp/**', '**/.artifacts/**', '**/.jest-cache/**', '**/coverage/**'],
      },
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

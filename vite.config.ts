import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import glsl from 'vite-plugin-glsl';
import path from 'path';

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
          entry: path.resolve(__dirname, 'src/index.ts'),
          name: 'GaesupWorld',
          fileName: mode === 'esm' ? 'index' : 'index',
          formats: mode === 'esm' ? ['es'] : ['cjs'],
        },
        rollupOptions: {
          external: [
            'react',
            'react-dom',
            'three',
            '@react-three/fiber',
            '@react-three/drei',
            '@react-three/rapier',
            '@dimforge/rapier3d',
            '@dimforge/rapier3d-compat',
            'jotai',
            'leva',
            'react-device-detect',
            'react-icons',
            'react-use-refs',
            'three-stdlib',
          ],
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
    },
  };
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isLibraryBuild = mode === 'esm' || mode === 'cjs';

  if (isLibraryBuild) {
    // Library build configuration
    return {
      plugins: [react()],
      resolve: {
        alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
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

  // Development/demo build configuration
  return {
    plugins: [react()],
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        { find: '@components', replacement: path.resolve(__dirname, 'examples/src/components') },
        { find: '@styles', replacement: path.resolve(__dirname, 'examples/styles') },
        { find: '@constants', replacement: path.resolve(__dirname, 'examples/src/constants') },
        { find: '@type', replacement: path.resolve(__dirname, 'examples/src/type') },
        { find: '@containers', replacement: path.resolve(__dirname, 'examples/src/containers') },
        { find: '@utils', replacement: path.resolve(__dirname, 'examples/src/utils') },
        { find: '@store', replacement: path.resolve(__dirname, 'examples/src/store') },
        { find: '@api', replacement: path.resolve(__dirname, 'examples/src/api') },
        { find: '@common', replacement: path.resolve(__dirname, 'examples/src/common') },
      ],
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

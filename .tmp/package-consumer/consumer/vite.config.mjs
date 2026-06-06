import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'vite-dist',
    sourcemap: false,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.VITE_ENABLE_BRIDGE_LOGS': JSON.stringify(''),
  },
});

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [react(), vanillaExtractPlugin(), svgr()],
  resolve: {
    alias: [
      { find: '@components', replacement: '/examples/components' },
      { find: '@common', replacement: '/examples/common' },
      { find: '@constants', replacement: '/examples/constants' },
      { find: '@hooks', replacement: '/examples/hooks' },
      { find: '@styles', replacement: '/examples/styles' },
      { find: '@utils', replacement: '/examples/utils' },
      { find: '@store', replacement: '/examples/store' },
      { find: '@containers', replacement: '/examples/containers' },
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Three.js 관련 라이브러리들을 별도 청크로 분리
          'three-core': ['three'],
          'three-fiber': ['@react-three/fiber'],
          'three-drei': ['@react-three/drei'],
          'three-rapier': ['@react-three/rapier'],
          // React 관련 라이브러리들을 별도 청크로 분리
          'react-vendor': ['react', 'react-dom'],
          // 물리 엔진을 별도 청크로 분리 (가장 큰 라이브러리)
          'physics-engine': ['@dimforge/rapier3d-compat'],
        },
      },
    },
    // 청크 크기 경고 임계값 조정
    chunkSizeWarningLimit: 500,
  },
});

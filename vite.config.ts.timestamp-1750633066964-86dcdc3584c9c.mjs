// vite.config.ts
import { defineConfig } from "file:///C:/Users/ydh22/Desktop/gaesup-world/.yarn/__virtual__/vite-virtual-b9dc29a5ea/3/AppData/Local/Yarn/Berry/cache/vite-npm-5.4.19-6d369030b0-10c0.zip/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/ydh22/Desktop/gaesup-world/.yarn/__virtual__/@vitejs-plugin-react-swc-virtual-37defd3e64/3/AppData/Local/Yarn/Berry/cache/@vitejs-plugin-react-swc-npm-3.10.1-45f958598f-10c0.zip/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\ydh22\\Desktop\\gaesup-world";
var vite_config_default = defineConfig(({ mode }) => {
  const isLibraryBuild = mode === "esm" || mode === "cjs";
  if (isLibraryBuild) {
    return {
      plugins: [react()],
      resolve: {
        alias: [{ find: "@", replacement: path.resolve(__vite_injected_original_dirname, "src") }]
      },
      build: {
        lib: {
          entry: path.resolve(__vite_injected_original_dirname, "src/index.ts"),
          name: "GaesupWorld",
          fileName: mode === "esm" ? "index" : "index",
          formats: mode === "esm" ? ["es"] : ["cjs"]
        },
        rollupOptions: {
          external: [
            "react",
            "react-dom",
            "three",
            "@react-three/fiber",
            "@react-three/drei",
            "@react-three/rapier",
            "@dimforge/rapier3d",
            "@dimforge/rapier3d-compat",
            "jotai",
            "leva",
            "react-device-detect",
            "react-icons",
            "react-use-refs",
            "three-stdlib"
          ],
          output: {
            globals: {
              react: "React",
              "react-dom": "ReactDOM",
              three: "THREE"
            }
          }
        },
        outDir: mode === "esm" ? "dist" : "dist",
        emptyOutDir: false
      },
      define: {
        "process.env.NODE_ENV": JSON.stringify("production")
      }
    };
  }
  return {
    plugins: [react()],
    resolve: {
      alias: [
        { find: "@", replacement: path.resolve(__vite_injected_original_dirname, "src") },
        { find: "@core", replacement: path.resolve(__vite_injected_original_dirname, "src/core") },
        { find: "@hooks", replacement: path.resolve(__vite_injected_original_dirname, "src/core/hooks") },
        { find: "@stores", replacement: path.resolve(__vite_injected_original_dirname, "src/core/stores") },
        { find: "@components", replacement: path.resolve(__vite_injected_original_dirname, "src/core/components") },
        { find: "@constants", replacement: path.resolve(__vite_injected_original_dirname, "src/core/constants") },
        { find: "@utils", replacement: path.resolve(__vite_injected_original_dirname, "src/core/utils") },
        { find: "@types", replacement: path.resolve(__vite_injected_original_dirname, "src/core/types") },
        { find: "@motions", replacement: path.resolve(__vite_injected_original_dirname, "src/core/motions") },
        { find: "@debug", replacement: path.resolve(__vite_injected_original_dirname, "src/core/debug") }
      ]
    },
    server: {
      port: 3e3,
      open: true
    },
    build: {
      outDir: "demo-dist",
      sourcemap: true
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode === "production" ? "production" : "development")
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx5ZGgyMlxcXFxEZXNrdG9wXFxcXGdhZXN1cC13b3JsZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxceWRoMjJcXFxcRGVza3RvcFxcXFxnYWVzdXAtd29ybGRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3lkaDIyL0Rlc2t0b3AvZ2Flc3VwLXdvcmxkL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcclxuICBjb25zdCBpc0xpYnJhcnlCdWlsZCA9IG1vZGUgPT09ICdlc20nIHx8IG1vZGUgPT09ICdjanMnO1xyXG4gIGlmIChpc0xpYnJhcnlCdWlsZCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcGx1Z2luczogW3JlYWN0KCldLFxyXG4gICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgYWxpYXM6IFt7IGZpbmQ6ICdAJywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSB9XSxcclxuICAgICAgfSxcclxuICAgICAgYnVpbGQ6IHtcclxuICAgICAgICBsaWI6IHtcclxuICAgICAgICAgIGVudHJ5OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2luZGV4LnRzJyksXHJcbiAgICAgICAgICBuYW1lOiAnR2Flc3VwV29ybGQnLFxyXG4gICAgICAgICAgZmlsZU5hbWU6IG1vZGUgPT09ICdlc20nID8gJ2luZGV4JyA6ICdpbmRleCcsXHJcbiAgICAgICAgICBmb3JtYXRzOiBtb2RlID09PSAnZXNtJyA/IFsnZXMnXSA6IFsnY2pzJ10sXHJcbiAgICAgICAgfSxcclxuICAgICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgICBleHRlcm5hbDogW1xyXG4gICAgICAgICAgICAncmVhY3QnLFxyXG4gICAgICAgICAgICAncmVhY3QtZG9tJyxcclxuICAgICAgICAgICAgJ3RocmVlJyxcclxuICAgICAgICAgICAgJ0ByZWFjdC10aHJlZS9maWJlcicsXHJcbiAgICAgICAgICAgICdAcmVhY3QtdGhyZWUvZHJlaScsXHJcbiAgICAgICAgICAgICdAcmVhY3QtdGhyZWUvcmFwaWVyJyxcclxuICAgICAgICAgICAgJ0BkaW1mb3JnZS9yYXBpZXIzZCcsXHJcbiAgICAgICAgICAgICdAZGltZm9yZ2UvcmFwaWVyM2QtY29tcGF0JyxcclxuICAgICAgICAgICAgJ2pvdGFpJyxcclxuICAgICAgICAgICAgJ2xldmEnLFxyXG4gICAgICAgICAgICAncmVhY3QtZGV2aWNlLWRldGVjdCcsXHJcbiAgICAgICAgICAgICdyZWFjdC1pY29ucycsXHJcbiAgICAgICAgICAgICdyZWFjdC11c2UtcmVmcycsXHJcbiAgICAgICAgICAgICd0aHJlZS1zdGRsaWInLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiB7XHJcbiAgICAgICAgICAgICAgcmVhY3Q6ICdSZWFjdCcsXHJcbiAgICAgICAgICAgICAgJ3JlYWN0LWRvbSc6ICdSZWFjdERPTScsXHJcbiAgICAgICAgICAgICAgdGhyZWU6ICdUSFJFRScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3V0RGlyOiBtb2RlID09PSAnZXNtJyA/ICdkaXN0JyA6ICdkaXN0JyxcclxuICAgICAgICBlbXB0eU91dERpcjogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICAgIGRlZmluZToge1xyXG4gICAgICAgICdwcm9jZXNzLmVudi5OT0RFX0VOVic6IEpTT04uc3RyaW5naWZ5KCdwcm9kdWN0aW9uJyksXHJcbiAgICAgIH0sXHJcbiAgICB9O1xyXG4gIH1cclxuICByZXR1cm4ge1xyXG4gICAgcGx1Z2luczogW3JlYWN0KCldLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczogW1xyXG4gICAgICAgIHsgZmluZDogJ0AnLCByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpIH0sXHJcbiAgICAgICAgeyBmaW5kOiAnQGNvcmUnLCByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb3JlJykgfSxcclxuICAgICAgICB7IGZpbmQ6ICdAaG9va3MnLCByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb3JlL2hvb2tzJykgfSxcclxuICAgICAgICB7IGZpbmQ6ICdAc3RvcmVzJywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY29yZS9zdG9yZXMnKSB9LFxyXG4gICAgICAgIHsgZmluZDogJ0Bjb21wb25lbnRzJywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY29yZS9jb21wb25lbnRzJykgfSxcclxuICAgICAgICB7IGZpbmQ6ICdAY29uc3RhbnRzJywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY29yZS9jb25zdGFudHMnKSB9LFxyXG4gICAgICAgIHsgZmluZDogJ0B1dGlscycsIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvcmUvdXRpbHMnKSB9LFxyXG4gICAgICAgIHsgZmluZDogJ0B0eXBlcycsIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvcmUvdHlwZXMnKSB9LFxyXG4gICAgICAgIHsgZmluZDogJ0Btb3Rpb25zJywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY29yZS9tb3Rpb25zJykgfSxcclxuICAgICAgICB7IGZpbmQ6ICdAZGVidWcnLCByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb3JlL2RlYnVnJykgfSxcclxuICAgICAgXSxcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgcG9ydDogMzAwMCxcclxuICAgICAgb3BlbjogdHJ1ZSxcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICBvdXREaXI6ICdkZW1vLWRpc3QnLFxyXG4gICAgICBzb3VyY2VtYXA6IHRydWUsXHJcbiAgICB9LFxyXG4gICAgZGVmaW5lOiB7XHJcbiAgICAgICdwcm9jZXNzLmVudi5OT0RFX0VOVic6IEpTT04uc3RyaW5naWZ5KG1vZGUgPT09ICdwcm9kdWN0aW9uJyA/ICdwcm9kdWN0aW9uJyA6ICdkZXZlbG9wbWVudCcpLFxyXG4gICAgfSxcclxuICB9O1xyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxUyxTQUFTLG9CQUFvQjtBQUNsVSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRmpCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0saUJBQWlCLFNBQVMsU0FBUyxTQUFTO0FBQ2xELE1BQUksZ0JBQWdCO0FBQ2xCLFdBQU87QUFBQSxNQUNMLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxNQUNqQixTQUFTO0FBQUEsUUFDUCxPQUFPLENBQUMsRUFBRSxNQUFNLEtBQUssYUFBYSxLQUFLLFFBQVEsa0NBQVcsS0FBSyxFQUFFLENB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

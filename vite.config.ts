import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  plugins: [react(), vanillaExtractPlugin(), svgr()],
  resolve: {
    alias: [
      { find: "@components", replacement: "/examples/components" },
      { find: "@common", replacement: "/examples/common" },
      { find: "@constants", replacement: "/examples/constants" },
      { find: "@hooks", replacement: "/examples/hooks" },
      { find: "@styles", replacement: "/examples/styles" },
      { find: "@utils", replacement: "/examples/utils" },
      { find: "@store", replacement: "/examples/store" },
      { find: "@containers", replacement: "/examples/containers" },
    ],
  },
});

import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import blinkoPlugin from "vite-plugin-blinko";

/**
 * Vite configuration for Blinko plugin
 */
export default defineConfig(({ mode }) => ({
  plugins: [
    preact(),
    ...blinkoPlugin()
  ],
  build: {
    minify: "terser", // 显式设置使用terser进行压缩
    terserOptions: {
      mangle: {
        reserved: ['rt', 'fe', 'withSettingPanel'], // 保留这些变量名不被混淆
      },
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  esbuild: {
    minifyIdentifiers: false, // 不压缩标识符
  }
}));

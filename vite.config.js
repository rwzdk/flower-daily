import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "./",
  plugins: [vue()],
  server: {
    proxy: {
      // 本地开发：/api 转发到 wrangler dev 起的 Worker
      "/api": "http://127.0.0.1:8787"
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        mobile: fileURLToPath(new URL("./mobile.html", import.meta.url))
      }
    }
  }
});

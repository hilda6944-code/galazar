import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/lmstudio': {
        target: 'http://127.0.0.1:1234',
        changeOrigin: false,
        rewrite: (requestPath) => requestPath.replace(/^\/lmstudio/, '/v1'),
      },
      '/comfy': {
        target: 'http://127.0.0.1:8188',
        changeOrigin: false,
        rewrite: (requestPath) => requestPath.replace(/^\/comfy/, ''),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

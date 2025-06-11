import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/", // Explicitly set for clarity, matches Netlify default
  envPrefix: "VITE_", // Ensure only VITE_* env vars are exposed
  build: {
    outDir: "dist", // Default, but explicit for Netlify
    assetsDir: "assets", // Default, organizes images, fonts, etc.
    minify: "esbuild", // Optimize bundle size
    sourcemap: false, // Disable sourcemaps in production for security
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

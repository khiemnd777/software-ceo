import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: "./",
  optimizeDeps: { entries: ["index.html"] },
  build: { target: "es2022", sourcemap: true },
  server: { port: 5173, strictPort: true },
});

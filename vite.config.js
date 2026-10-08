import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/sources": "http://localhost:8000",
      "/groups": "http://localhost:8000",
      "/chat": "http://localhost:8000",
      "/search": "http://localhost:8000",
    },
  },
});

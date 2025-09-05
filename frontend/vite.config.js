import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config with history fallback so React Router routes like /health work
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist"
  },
  server: {
    port: 5173,
    // Ensures frontend serves index.html for any unknown route
    historyApiFallback: true
  }
});

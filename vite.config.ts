import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Heavy leaf libraries with no React dependency — safe to isolate.
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
            // Keep React and EVERY React-coupled library in one chunk.
            // Splitting them apart caused a cross-chunk circular init:
            // libraries that call createContext() at load time (e.g. next-themes)
            // executed before React was defined -> "Cannot read properties of
            // undefined (reading 'createContext')" white-screen crash in prod.
            return 'vendor';
          }
          // App code (pages/components) is split automatically via React.lazy.
        },
      },
    },
    sourcemap: mode === 'production' ? false : true,
    minify: 'esbuild',
    cssCodeSplit: true,
  },
}));

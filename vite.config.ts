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
          // Separate vendor chunks cleanly - order matters, specific first
          if (id.includes('node_modules')) {
            if (id.includes('@supabase/supabase-js')) return 'vendor-supabase';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('@tanstack/react-query')) return 'vendor-query';
            if (id.includes('react-hook-form') || id.includes('@hookform/resolvers')) return 'vendor-forms';
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority') || id.includes('lucide-react') || id.includes('date-fns') || id.includes('zod')) return 'vendor-utils';
            if (id.includes('react')) return 'vendor-react';
            // Everything else in node_modules - split large deps
            if (id.includes('html2canvas') || id.includes('jspdf') || id.includes('react-markdown')) return 'vendor-heavy';
            return 'vendor-other';
          }
          // Page chunks - match exact files to avoid partial matches
          if (id.endsWith('src/pages/Chat.tsx')) return 'page-chat';
          if (id.endsWith('src/pages/Analytics.tsx')) return 'page-analytics';
          if (id.endsWith('src/pages/Health.tsx')) return 'page-health';
          if (id.endsWith('src/pages/Learning.tsx')) return 'page-learning';
          if (id.endsWith('src/pages/Productivity.tsx')) return 'page-productivity';
          if (id.endsWith('src/pages/Finance.tsx')) return 'page-finance';
          if (id.endsWith('src/pages/Documents.tsx')) return 'page-documents';
          if (id.endsWith('src/pages/Gallery.tsx')) return 'page-gallery';
          if (id.endsWith('src/pages/Settings.tsx')) return 'page-settings';
        },
      },
    },
    sourcemap: mode === 'production' ? false : true,
    minify: 'esbuild',
    cssCodeSplit: true,
  },
}));

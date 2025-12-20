import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                // React core
                if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                  return 'react-vendor';
                }
                // Charts
                if (id.includes('recharts') || id.includes('d3')) {
                  return 'charts-vendor';
                }
                // Firebase
                if (id.includes('firebase')) {
                  return 'firebase-vendor';
                }
                // PDF/Excel exports
                if (id.includes('jspdf') || id.includes('xlsx') || id.includes('html2canvas')) {
                  return 'export-vendor';
                }
                // Utils
                if (id.includes('date-fns') || id.includes('uuid') || id.includes('lucide')) {
                  return 'utils-vendor';
                }
              }
            }
          }
        }
      }
    };
});

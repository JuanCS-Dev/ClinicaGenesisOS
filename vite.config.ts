import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
          manifest: {
            name: 'ClinicaGenesisOS',
            short_name: 'Genesis',
            description: 'Sistema de Gestão para Clínicas Médicas - A melhor aplicação médica do Brasil',
            theme_color: '#1a1a2e',
            background_color: '#F5F5F7',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            categories: ['medical', 'health', 'productivity'],
            icons: [
              {
                src: '/icons/icon-72x72.png',
                sizes: '72x72',
                type: 'image/png',
                purpose: 'maskable any'
              },
              {
                src: '/icons/icon-96x96.png',
                sizes: '96x96',
                type: 'image/png',
                purpose: 'maskable any'
              },
              {
                src: '/icons/icon-128x128.png',
                sizes: '128x128',
                type: 'image/png',
                purpose: 'maskable any'
              },
              {
                src: '/icons/icon-144x144.png',
                sizes: '144x144',
                type: 'image/png',
                purpose: 'maskable any'
              },
              {
                src: '/icons/icon-152x152.png',
                sizes: '152x152',
                type: 'image/png',
                purpose: 'maskable any'
              },
              {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable any'
              },
              {
                src: '/icons/icon-384x384.png',
                sizes: '384x384',
                type: 'image/png',
                purpose: 'maskable any'
              },
              {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable any'
              }
            ],
            shortcuts: [
              {
                name: 'Agenda',
                short_name: 'Agenda',
                description: 'Ver agenda de consultas',
                url: '/agenda',
                icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
              },
              {
                name: 'Pacientes',
                short_name: 'Pacientes',
                description: 'Lista de pacientes',
                url: '/pacientes',
                icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'firestore-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 // 24 hours
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'gstatic-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              }
            ],
            navigateFallback: '/offline.html',
            navigateFallbackDenylist: [/^\/api/]
          },
          devOptions: {
            enabled: true,
            type: 'module'
          }
        })
      ],
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

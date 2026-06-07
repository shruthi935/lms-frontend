import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/lms-frontend-lilac-eight\.vercel\.app\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 0 },
            },
          },
        ],
      },
      manifest: {
        name: 'Open Academy LMS',
        short_name: 'LMS',
        theme_color: '#4338ca',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'favicon-96x96.png', sizes: '96x96', type: 'image/png' }
        ]
      }
    })
  ]
});
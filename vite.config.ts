import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
    manifest: {
      name: 'Dashboard personal de Ángel',
      short_name: 'Mi espacio',
      description: 'Un espacio personal que funciona sin conexión.',
      theme_color: '#050505',
      background_color: '#050505',
      display: 'standalone',
      start_url: base,
      scope: base,
      icons: [
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'] },
  })],
})

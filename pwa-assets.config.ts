import { defineConfig } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    transparent: {
      sizes: [192, 512],
      padding: 0,
      resizeOptions: { background: '#050505' },
    },
    maskable: {
      sizes: [512],
      padding: 0,
      resizeOptions: { background: '#050505' },
    },
    apple: {
      sizes: [180],
      padding: 0,
      resizeOptions: { background: '#050505' },
    },
  },
  images: ['public/logo-white.svg'],
})

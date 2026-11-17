import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const publicDir = path.join(root, 'public')
const whiteLogo = path.join(publicDir, 'nuevos-logos', 'LogoPersonalBlanco.svg')
const blackLogo = path.join(publicDir, 'nuevos-logos', 'LogoPersonalNegro.svg')
const background = '#050505'

async function copyLogos() {
  await Promise.all([
    writeFile(path.join(publicDir, 'logo-white.svg'), await readFile(whiteLogo)),
    writeFile(path.join(publicDir, 'logo-black.svg'), await readFile(blackLogo)),
  ])
}

async function renderIcon(size, scale, name) {
  const logoSize = Math.round(size * scale)
  const logo = await sharp(whiteLogo, { density: 600 })
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, name))
}

async function buildFaviconSvg() {
  const source = await readFile(whiteLogo, 'utf8')
  const inner = source.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="${background}" />
  <svg x="10" y="10" width="80" height="80" viewBox="0 0 900.79437 889.99792">${inner}</svg>
</svg>
`
  await writeFile(path.join(publicDir, 'favicon.svg'), svg)
  return svg
}

await copyLogos()
await Promise.all([
  renderIcon(192, 1, 'pwa-192x192.png'),
  renderIcon(512, 1, 'pwa-512x512.png'),
  renderIcon(512, 0.8, 'maskable-icon-512x512.png'),
  renderIcon(180, 0.9, 'apple-touch-icon-180x180.png'),
])

const faviconSvg = await buildFaviconSvg()
await sharp(Buffer.from(faviconSvg), { density: 600 })
  .resize(32, 32)
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, 'favicon-32x32.png'))

console.log('Iconos generados en public/: pwa 192/512, maskable 512, apple-touch 180, favicon.svg y favicon-32x32.png')

# Decisiones del proyecto

## Fase 1B

- Los iconos de PWA se generan con `@vite-pwa/assets-generator` desde `public/logo-white.svg`, con un fondo `#050505` incorporado al SVG y padding cero para conservar el tamaño de marca dibujado; el PNG maskable mantiene el logo centrado en la zona segura.
- Se generan iconos PNG de 192×192, 512×512, maskable 512×512 y Apple touch 180×180. El manifest incluye los dos tamaños estándar y el maskable; `index.html` enlaza el icono de Apple.
- `VITE_BASE` permite cambiar la subruta de Vite; su valor predeterminado es `/DashBoardPersonal/`, correspondiente al repositorio de GitHub Pages.
- GitHub Pages se construye y publica mediante GitHub Actions al hacer push a `main` o iniciar el workflow manualmente.
- La instalación de `sharp` necesita su script de instalación permitido para ejecutar el generador de iconos.

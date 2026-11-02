# Decisiones del proyecto

## Fase 1B

- Los iconos de PWA se generan con `@vite-pwa/assets-generator` desde `public/logo-white.svg`, con un fondo `#050505` incorporado al SVG y padding cero para conservar el tamaño de marca dibujado; el PNG maskable mantiene el logo centrado en la zona segura.
- Se generan iconos PNG de 192×192, 512×512, maskable 512×512 y Apple touch 180×180. El manifest incluye los dos tamaños estándar y el maskable; `index.html` enlaza el icono de Apple.
- `VITE_BASE` permite cambiar la subruta de Vite; su valor predeterminado es `/DashBoardPersonal/`, correspondiente al repositorio de GitHub Pages.
- GitHub Pages se construye y publica mediante GitHub Actions al hacer push a `main` o iniciar el workflow manualmente.
- La instalación de `sharp` necesita su script de instalación permitido para ejecutar el generador de iconos.

## Fase 2A-1

- Dexie sube de la versión 1 a la 2. La migración agrega la tabla `accounts` e índices para las cuentas de origen y destino de un movimiento, sin transformar ni borrar registros existentes.
- Una transferencia es un solo `Transaction` de tipo `transfer`: resta de `accountId`, suma a `transferAccountId` y no entra en totales de ingreso ni gasto. Los movimientos v1 siguen siendo válidos porque los campos de cuenta son opcionales.
- Las cuentas tienen `openingBalanceCents` y `archived`; el saldo se calcula únicamente con esa apertura y movimientos activos. Un saldo negativo es válido, en especial para tarjetas.
- No se agregaron dependencias: Dexie y Vitest ya cubren la migración y las pruebas de la lógica financiera.

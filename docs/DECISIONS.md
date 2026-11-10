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

## Fase 2A — pulido de Finanzas

- El aviso con Deshacer (toast) se cierra solo a los 6 s y se reemplaza (no se apila); se pausa mientras el usuario lo mantiene presionado. El tiempo vive en `src/lib/toast.ts` y la barra de progreso usa `transform: scaleX`.
- Cerrar el sheet de registro con muesca arrastrada, toque en la muesca o toque en el fondo pasa por una protección: si hay monto o nota escritos, se pide confirmación con `window.confirm` (nativo, offline, sin dependencias). Si se descarta, el borrador se limpia.
- El bloqueo de scroll del fondo usa `position: fixed` sobre `body` con la posición restaurada al cerrar, porque `overflow: hidden` no basta en Safari iOS.
- "Agregar gasto" en Inicio abre el sheet de registro: el estado del sheet se elevó a `App` (en lugar de un contexto) por ser lo más simple.

## Fase 2B-1

- El día de inicio del período es una preferencia local pequeña (`dashboard-finance-period-start-day`), por lo que se guarda en `localStorage` como la preferencia de color; no es un dato sincronizable.
- La clave `month` de un presupuesto identifica el mes en que inicia el período. Si se elige el día 29, 30 o 31, cada período comienza en el último día disponible de ese mes.

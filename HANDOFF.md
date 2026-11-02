# HANDOFF.md — Estado para continuar con cualquier herramienta

> Lo actualiza Codex (o quien trabaje) al terminar cada bloque. Si Codex se queda sin cuota, Cursor/OpenCode/modelo local retoman desde aquí.

## Estado actual
- Fase / bloque en curso: Fase 2A; 2A-1 completado. El siguiente bloque es 2A-2 (cuentas y registro rápido).
- Último commit estable: pendiente de crear para 2A-1 al cierre de este bloque.
- ¿Compila `npm run build`?: Sí; build, lint y 19 pruebas verificados el 2026-11-02.

## Hecho
- Vite + React + TypeScript estricto, Tailwind CSS v4, ESLint y Vitest configurados.
- Tokens de `DESIGN.md` en `@theme`, incluida Inter Variable local.
- Color por hora local en `data-tone`; se actualiza al abrir, al volver a primer plano y cada minuto como máximo. El selector manual usa una preferencia pequeña en `localStorage` (permitida para preferencias).
- Componentes base: Button, IconButton, Card, ListItem, Input/AmountInput, Chip, Tabs, BottomNav, SideNav, EmptyState y Sheet.
- Shell con Inicio, Finanzas y Más; navegación inferior en móvil y lateral desde 1024 px.
- Pruebas unitarias de las franjas horarias: 9 casos pasan.
- Detector de Impeccable ejecutado sobre `src`: sin hallazgos.
- Bloque 1B completado: esquema Dexie v1 y categorías por defecto, iconos PWA, manifest, workflow de GitHub Pages y decisiones documentadas.
- Bloque 2A-1 completado: Dexie v2 conserva datos v1, agrega cuentas e índices de origen/destino para transferencias. Incluye cuentas iniciales Efectivo, Banco y Ahorro.
- La lógica financiera está en `src/lib/money.ts` y `src/lib/budget.ts`, con pruebas para conversión sin flotantes, transferencias, borrado lógico, cambio de mes y saldo negativo.

## Sigue (siguiente bloque exacto)
- Fase 2A-2: pantalla de Finanzas para crear, editar y archivar cuentas; registro rápido en sheet con el importe enfocado y teclado numérico, guardado local, deshacer y máximo tres toques para un gasto típico.

## Cómo probar
- `npm install`
- `npm run dev`
- `npm run build`, `npm run lint`, `npm run test`
- Para probar la base: abre DevTools > Application > IndexedDB tras cargar la app y verifica las tablas `accounts`, `transactions`, `categories` y `budgets`. La siembra de cuentas se conectará al arranque en 2A-2.
- En móvil: comprueba la barra inferior, los márgenes de safe area y el selector de tono en Más. En escritorio (>=1024 px), comprueba la barra lateral.

## Decisiones y notas
- `VITE_BASE` predetermina `/DashBoardPersonal/` y permite configurar otra subruta.
- Los iconos se generan desde `public/logo-white.svg` con fondo `#050505` mediante `npm run generate-pwa-assets`.
- GitHub Actions publica GitHub Pages en push a `main` y también permite ejecución manual.
- El comando distribuido de Impeccable solo expone `detect`; `audit` y `critique` no están disponibles en esta versión. El detector no encontró problemas.
- Las transferencias se guardan como un único movimiento y no alteran los totales de ingresos/gastos; las cuentas admiten saldo negativo.

## Problemas abiertos
- En iPhone: instalar desde Safari, abrir una vez con conexión y verificar que abre en modo avión.
- En GitHub, confirmar que Pages está configurado para GitHub Actions y que el workflow completa el deploy.

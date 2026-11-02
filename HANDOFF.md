# HANDOFF.md — Estado para continuar con cualquier herramienta

> Lo actualiza Codex (o quien trabaje) al terminar cada bloque. Si Codex se queda sin cuota, Cursor/OpenCode/modelo local retoman desde aquí.

## Estado actual
- Fase / bloque en curso: Fase 1 completada; el siguiente bloque es Fase 2.
- Último commit estable: cierre del bloque 1B (commit en esta sesión).
- ¿Compila `npm run build`?: Sí; build, lint y 11 pruebas verificados el 2026-11-02.

## Hecho
- Vite + React + TypeScript estricto, Tailwind CSS v4, ESLint y Vitest configurados.
- Tokens de `DESIGN.md` en `@theme`, incluida Inter Variable local.
- Color por hora local en `data-tone`; se actualiza al abrir, al volver a primer plano y cada minuto como máximo. El selector manual usa una preferencia pequeña en `localStorage` (permitida para preferencias).
- Componentes base: Button, IconButton, Card, ListItem, Input/AmountInput, Chip, Tabs, BottomNav, SideNav, EmptyState y Sheet.
- Shell con Inicio, Finanzas y Más; navegación inferior en móvil y lateral desde 1024 px.
- Pruebas unitarias de las franjas horarias: 9 casos pasan.
- Detector de Impeccable ejecutado sobre `src`: sin hallazgos.
- Bloque 1B completado: esquema Dexie v1 y categorías por defecto, iconos PWA, manifest, workflow de GitHub Pages y decisiones documentadas.

## Sigue (siguiente bloque exacto)
- Fase 2, Finanzas v1: funciones puras de dinero y presupuesto con pruebas. No iniciar hasta comenzar una sesión para esa fase.

## Cómo probar
- `npm install`
- `npm run dev`
- `npm run build`, `npm run lint`, `npm test`
- En móvil: comprueba la barra inferior, los márgenes de safe area y el selector de tono en Más. En escritorio (>=1024 px), comprueba la barra lateral.

## Decisiones y notas
- `VITE_BASE` predetermina `/DashBoardPersonal/` y permite configurar otra subruta.
- Los iconos se generan desde `public/logo-white.svg` con fondo `#050505` mediante `npm run generate-pwa-assets`.
- GitHub Actions publica GitHub Pages en push a `main` y también permite ejecución manual.
- El comando distribuido de Impeccable solo expone `detect`; `audit` y `critique` no están disponibles en esta versión. El detector no encontró problemas.

## Problemas abiertos
- En iPhone: instalar desde Safari, abrir una vez con conexión y verificar que abre en modo avión.
- En GitHub, confirmar que Pages está configurado para GitHub Actions y que el workflow completa el deploy.

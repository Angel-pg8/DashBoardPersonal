# HANDOFF.md — Estado para continuar con cualquier herramienta

> Lo actualiza Codex (o quien trabaje) al terminar cada bloque. Si Codex se queda sin cuota, Cursor/OpenCode/modelo local retoman desde aquí.

## Estado actual
- Fase / bloque en curso: Fase 1, bloque 1A completado.
- Último commit estable: `feat: create phase 1a design shell`.
- ¿Compila `npm run build`?: Sí (verificado el 2026-10-31).

## Hecho
- Vite + React + TypeScript estricto, Tailwind CSS v4, ESLint y Vitest configurados.
- Tokens de `DESIGN.md` en `@theme`, incluida Inter Variable local.
- Color por hora local en `data-tone`; se actualiza al abrir, al volver a primer plano y cada minuto como máximo. El selector manual usa una preferencia pequeña en `localStorage` (permitida para preferencias).
- Componentes base: Button, IconButton, Card, ListItem, Input/AmountInput, Chip, Tabs, BottomNav, SideNav, EmptyState y Sheet.
- Shell con Inicio, Finanzas y Más; navegación inferior en móvil y lateral desde 1024 px.
- Pruebas unitarias de las franjas horarias: 9 casos pasan.
- Detector de Impeccable ejecutado sobre `src`: sin hallazgos.

## Sigue (siguiente bloque exacto)
- Fase 1, bloque 1B: PWA/offline, iconos maskable con hexágono, GitHub Pages, Dexie/categorías y `docs/DECISIONS.md`.

## Cómo probar
- `npm install`
- `npm run dev`
- `npm run build`, `npm run lint`, `npm run test`
- En móvil: comprueba la barra inferior, los márgenes de safe area y el selector de tono en Más. En escritorio (>=1024 px), comprueba la barra lateral.

## Decisiones y notas
- Se respetó estrictamente el alcance 1A. PWA, Dexie, iconos, despliegue y `docs/DECISIONS.md` pertenecen al bloque 1B y no se adelantaron.
- El comando distribuido de Impeccable solo expone `detect`; `audit` y `critique` no están disponibles en esta versión. El detector no encontró problemas.

## Problemas abiertos
- El siguiente bloque debe implementar la instalación/offline real antes de probar modo avión o instalación iOS.

# HANDOFF.md — Estado para continuar con cualquier herramienta

> Lo actualiza Codex (o quien trabaje) al terminar cada bloque. Si Codex se queda sin cuota, Cursor/OpenCode/modelo local retoman desde aquí.

## Estado actual
- Fase / bloque en curso: Fase 4A completada. Siguiente bloque: Fase 4B (Pomodoro: Temporizador resiliente y control de sesión).
- Último commit estable: `19bee16` (`docs: incorporar decisiones de usuario para Fase 4 (To do)`).
- ¿Compila `npm run build`?: Sí; build, lint y 82 pruebas verificados el 2026-11-23.

## Hecho
- Fase 4A completada: datos, tipos y lógica pura para Tareas y Pomodoro ("To do"):
  - Esquema Dexie v3 con tablas `tasks` y `pomodoroSessions` y migración que preserva intactos los datos de v1 y v2 sin alteración.
  - Tipos en `src/db/types.ts`: `Task`, `PomodoroSession`, `PomodoroSettings`, `TaskPriority` ('low' | 'medium' | 'high'), `TaskStatus`, `PomodoroSessionType`.
  - Lógica pura de tareas en `src/lib/tasks.ts` (filtros, ordenación por 3 prioridades y fecha, unicidad de tarea actual, borrado lógico, conteo de pomodoros).
  - Lógica pura de Pomodoro en `src/lib/pomodoro.ts` (cálculo por timestamps `targetEndAt`, resistencia a suspensión en iOS con recálculo exacto, ciclo de 4 descansos y `autoStartBreaks`).
  - 82 pruebas pasando en Vitest (21 pruebas nuevas en 4A).
- Planificación completa de la Fase 4 (Tareas + Pomodoro — "To do"):
  - Alcance v1 vs "después", pantallas y flujos (móvil y PC), modelo de datos para Dexie v3 con campos de sincronización (`SyncFields`), resiliencia a suspensión en iOS con cálculo basado en timestamps (`targetEndAt`), Wake Lock opcional, Web Audio API y vinculación de sesiones documentados en `docs/SPEC.md`.
  - Decisiones de usuario incorporadas en `docs/SPEC.md` y `docs/DECISIONS.md`: nombre "To do" para la 4.ª pestaña de navegación, configuración mediante icono de engranaje (⚙) en la propia pantalla combinada, 3 niveles de prioridad (Baja/Media/Alta), feedback sonoro sintético por código (Web Audio API), opción de auto-start de descansos configurable y aceptación del comportamiento de audio en iOS.
  - Fase 4 desglosada en subfases committeables (4A a 4D) con criterios de aceptación, archivos a tocar y pruebas en `docs/TASKS.md`.
- Pantalla de carga (splash) agregada en `index.html` con HTML + CSS inline (#050505, logo SVG blanco centrado inline, pulso suave con solo transform/opacity, respeto a prefers-reduced-motion, fade de 250 ms y mínimo visible de 350 ms, eliminación del DOM al montar).
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
- Fase 4B — Pomodoro: Temporizador resiliente y control de sesión:
  - Componente `PomodoroTimer` con selector de modalidad (Foco 25m, Descanso corto 5m, Descanso largo 15m), visor tabular y controles táctiles de 44 px.
  - Botón de engranaje (⚙) en cabecera para abrir `PomodoroSettingsSheet` con duraciones y `autoStartBreaks`.
  - Resiliencia a suspensión en iOS con listener de `visibilitychange` y `focus`.
  - Helpers defensivos de Screen Wake Lock (`src/lib/wakeLock.ts`) y Web Audio API (`src/lib/sound.ts`).
  - Guardado automático de sesiones completadas en `pomodoroSessions`.

## Cómo probar
- `npm install`
- `npm run dev`
- `npm run build`, `npm run lint`, `npm run test`
- Para probar la base: abre DevTools > Application > IndexedDB tras cargar la app y verifica las tablas `accounts`, `transactions`, `categories` y `budgets`. La siembra de cuentas se conectará al arranque en 2A-2.
- En móvil: comprueba la barra inferior, los márgenes de safe area y el selector de tono en Más. En escritorio (>=1024 px), comprueba la barra lateral.

## Decisiones y notas
- `VITE_BASE` predetermina `/DashBoardPersonal/` y permite configurar otra subruta.
- Los logos viven en `public/nuevos-logos/` (blanco y negro). `npm run generate-pwa-assets` los copia a `public/logo-white.svg` / `logo-black.svg` y regenera los iconos PWA con fondo `#050505`.
- GitHub Actions publica GitHub Pages en push a `main` y también permite ejecución manual.
- El comando distribuido de Impeccable solo expone `detect`; `audit` y `critique` no están disponibles en esta versión. El detector no encontró problemas.
- Las transferencias se guardan como un único movimiento y no alteran los totales de ingresos/gastos; las cuentas admiten saldo negativo.

## Problemas abiertos
- En iPhone: instalar desde Safari, abrir una vez con conexión y verificar que abre en modo avión.
- En GitHub, confirmar que Pages está configurado para GitHub Actions y que el workflow completa el deploy.

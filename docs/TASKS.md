# TASKS.md — Fases y criterios de aceptación

Regla: una fase por sesión de Codex. Marcar `[x]` al terminar y no adelantar la siguiente.

## Fase 1 — Base y diseño
- [ ] Proyecto Vite + React + TS con Tailwind v4, ESLint y Vitest configurados.
- [ ] `base` de Vite configurable (`VITE_BASE`) para GitHub Pages; workflow de despliegue en GitHub Actions.
- [ ] Tokens de `DESIGN.md` en `@theme`; Inter instalada localmente.
- [ ] Color por hora del día con `data-tone` (franjas de `DESIGN.md` sección 4) y ajuste manual guardado en preferencias.
- [ ] Componentes base de `DESIGN.md` sección 6 (al menos Button, Card, ListItem, Input, Chip, BottomNav, SideNav, EmptyState, Sheet).
- [ ] Shell: navegación inferior en móvil, lateral en ≥1024px; pantallas vacías: Inicio, Finanzas, Más.
- [ ] Hexágono como logo y como icono PWA (iconos 192/512 y maskable).
- [ ] PWA instalable y funcionando offline (service worker + manifest).
- [ ] Dexie con el esquema de `docs/SPEC.md` (Transaction, Category, Budget) y categorías iniciales por defecto.
- [ ] `docs/DECISIONS.md` con las decisiones tomadas.
**Aceptación:** `npm run build`, `lint` y `test` pasan; se instala en iPhone; con el modo avión sigue abriendo; contraste AA en todas las franjas; `/impeccable audit` sin hallazgos críticos.

## Fase 2 — Finanzas v1
- [ ] Funciones puras en `src/lib/money.ts` y `src/lib/budget.ts` con pruebas (formato, sumas por mes y categoría, presupuesto restante).
- [ ] Agregar, editar y borrar (lógico) movimientos en máximo 3 toques.
- [ ] Lista filtrable por mes y categoría.
- [ ] Presupuesto mensual total y por categoría.
- [ ] Gráfica simple por categoría (SVG/CSS, sin librería pesada).
- [ ] Resumen en Inicio.
**Aceptación:** todo funciona sin internet; datos persisten al cerrar la app; pruebas de la lógica pasan.

## Fase 3 — Sincronización
- [ ] Proyecto Supabase, tablas y reglas de seguridad por usuario (RLS).
- [ ] Login.
- [ ] Subir pendientes (`synced: false`) y bajar cambios; sincronizar al abrir, al volver a primer plano y en `online`.
- [ ] Resolución de conflictos por `updatedAt`; borrados propagados.
**Aceptación:** editar en PC y en iPhone, y que ambos converjan; nada se pierde sin conexión.

## Fase 4 — Tareas + Pomodoro
- [ ] Módulo de tareas y marca de tarea actual.
- [ ] Pantalla Pomodoro con la tarea actual; sesiones guardadas.
- [ ] Acceso desde Inicio.

## Fase 5 — Pulido
- [ ] Hábitos, notas.
- [ ] Exportar/importar respaldo (JSON).
- [ ] Revisión final de rendimiento, accesibilidad y diseño.

## Reserva
Una sesión de Codex queda libre para imprevistos.

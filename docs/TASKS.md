# TASKS.md — Fases y criterios de aceptación

Regla: una fase por sesión de Codex, **dividida en bloques**. Cada bloque termina compilando y con commit, y se registra en `docs/HANDOFF.md`. Marcar `[x]` al terminar y no adelantar el siguiente.

Si Codex se queda sin cuota a mitad de fase, el siguiente bloque sin marcar puede continuarse con Cursor/OpenCode o con un modelo local.

## Fase 1 — Base y diseño
**Bloque 1A (Codex):** proyecto, tokens, fuente local, color por hora, componentes base y shell de navegación.
**Bloque 1B (Codex o herramienta más barata):** PWA instalable/offline, iconos, despliegue a GitHub Pages, esquema de Dexie y `DECISIONS.md`.
- [x] Proyecto Vite + React + TS con Tailwind v4, ESLint y Vitest configurados.
- [x] `base` de Vite configurable (`VITE_BASE`) para GitHub Pages; workflow de despliegue en GitHub Actions.
- [x] Tokens de `DESIGN.md` en `@theme`; Inter instalada localmente.
- [x] Color por hora del día con `data-tone` (franjas de `DESIGN.md` sección 4) y ajuste manual guardado en preferencias.
- [x] Componentes base de `DESIGN.md` sección 6 (al menos Button, Card, ListItem, Input, Chip, BottomNav, SideNav, EmptyState, Sheet).
- [x] Shell: navegación inferior en móvil, lateral en ≥1024px; pantallas vacías: Inicio, Finanzas, Más.
- [x] Hexágono como logo y como icono PWA (iconos 192/512 y maskable).
- [x] PWA instalable y funcionando offline (service worker + manifest).
- [x] Dexie con el esquema de `docs/SPEC.md` (Transaction, Category, Budget) y categorías iniciales por defecto.
- [x] `docs/DECISIONS.md` con las decisiones tomadas.
**Aceptación:** `npm run build`, `lint` y `test` pasan; se instala en iPhone; con el modo avión sigue abriendo; contraste AA en todas las franjas; `/impeccable audit` sin hallazgos críticos.

## Fase 2A — Finanzas: núcleo
### 2A-1 Datos y lógica (sin interfaz)
- [x] Subir la versión del esquema de Dexie con migración (no borrar datos existentes) y agregar `accounts`, `transactions`, `categories`, `budgets`. Dinero en `amountCents`. Todos con `id`, `createdAt`, `updatedAt`, `deletedAt`, `synced`.
- [x] `src/lib/money.ts` (formato USD es-SV, texto ↔ centavos) y `src/lib/budget.ts` (sumas por periodo y categoría, saldo de cuenta, disponible, disponible por día) con pruebas en Vitest.
- [x] Datos iniciales: cuentas Efectivo, Banco y Ahorro; categorías base.
**Aceptación:** `build`, `lint` y `test` pasan; la lógica cubre transferencias (no cuentan como gasto ni ingreso).

### 2A-2 Cuentas y registro rápido
- [x] Cuentas: crear, editar y archivar; saldo calculado.
- [x] Bottom sheet de registro rápido (monto con teclado numérico abierto, Gasto/Ingreso/Transferencia, chips de categoría por uso, cuenta precargada, fecha Hoy/Ayer/Otra, nota opcional, "Guardar y añadir otro", toast con Deshacer).
**Aceptación:** un gasto típico en máximo 3 toques; funciona sin internet.

### 2A-3 Movimientos
- [x] Lista agrupada por día con subtotal, selector de mes, búsqueda y filtros (categoría, cuenta, tipo), editar y borrar (lógico).
**Aceptación:** los datos persisten al cerrar la app; todo funciona sin conexión.

## Fase 2B — Finanzas: control
- [ ] Ajuste "día de inicio del mes" (por defecto 1) usado por todos los cálculos de periodo.
- [ ] Presupuesto: total mensual y límite por categoría, barras de progreso (ámbar al 80 %, rojo al pasarse) y botón "Copiar mes anterior".
- [ ] Resumen en Inicio y pestaña Resumen: disponible del mes, disponible por día, saldo total, ingresos vs gastos, alertas de categorías cerca del límite y últimos movimientos.
- [ ] Recurrentes: plantillas que generan movimientos al abrir la app, con puesta al día si estuvo cerrada varios días.
- [ ] Análisis: gasto por categoría y tendencia de 6 meses en SVG/CSS, sin librería pesada.
- [ ] Exportar movimientos a CSV.
**Aceptación:** todo funciona sin internet; el presupuesto y el resumen coinciden con los movimientos; los recurrentes no se duplican al abrir la app varias veces; las pruebas pasan.

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

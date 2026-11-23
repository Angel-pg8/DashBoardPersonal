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
### 2B-1 Periodo, presupuesto y resumen
- [ ] Ajuste "día de inicio del mes" (por defecto 1), usado por todos los cálculos de periodo (lógica en `src/lib/` con pruebas, incluidos meses cortos y cambio de año).
- [ ] Presupuesto: total mensual y límite por categoría, barras de progreso (ámbar al 80 %, rojo al pasarse) y botón "Copiar mes anterior".
- [ ] Resumen en Inicio y pestaña Resumen: disponible del mes, disponible por día, saldo total, ingresos vs gastos, alertas de categorías cerca del límite y últimos movimientos.
**Aceptación:** funciona sin internet; presupuesto y resumen coinciden con los movimientos; pruebas, lint y build pasan.

### 2B-2 Recurrentes, análisis y exportar
- [ ] Recurrentes: plantillas que generan movimientos al abrir la app, con puesta al día si estuvo cerrada varios días, sin duplicarse al abrir varias veces.
- [ ] Análisis: gasto por categoría y tendencia de 6 meses en SVG/CSS, sin librería pesada.
- [ ] Exportar movimientos a CSV.
**Aceptación:** funciona sin internet; los recurrentes no se duplican; pruebas, lint y build pasan.

## Fase 3 — Sincronización
- [ ] Proyecto Supabase, tablas y reglas de seguridad por usuario (RLS).
- [ ] Login.
- [ ] Subir pendientes (`synced: false`) y bajar cambios; sincronizar al abrir, al volver a primer plano y en `online`.
- [ ] Resolución de conflictos por `updatedAt`; borrados propagados.
**Aceptación:** editar en PC y en iPhone, y que ambos converjan; nada se pierde sin conexión.

## Fase 4 — Tareas + Pomodoro ("To do")

### 4A — Datos, tipos y lógica pura (sin interfaz)
- [x] Subir el esquema de Dexie a versión 3 (`tasks`, `pomodoroSessions`) con migración que preserve intactos los datos de v1 y v2.
- [x] Tipos en `src/db/types.ts`: `Task`, `PomodoroSession`, `PomodoroSettings`, `TaskPriority` ('low' | 'medium' | 'high'), `TaskStatus`, `PomodoroSessionType`.
- [x] Lógica pura de tareas en `src/lib/tasks.ts` (filtrar pendientes/completadas, ordenar por 3 niveles de prioridad y fecha, alternar tarea actual exclusiva `isCurrent`, borrado lógico y cálculo de pomodoros).
- [x] Lógica pura de Pomodoro en `src/lib/pomodoro.ts` (cálculo de tiempo restante con marcas de tiempo `targetEndAt`, pausa acumulada sin desvío, detección de fin tras suspensión de pantalla, formato `MM:SS`, ciclo de 4 descansos, opción `autoStartBreaks` y duraciones configurables).
- [x] Pruebas en Vitest:
  - `src/lib/tasks.test.ts`: filtros, ordenación por 3 prioridades, unicidad de tarea actual y borrado lógico.
  - `src/lib/pomodoro.test.ts`: cálculo con salto temporal simulado de 25 min (suspensión de iOS), pausas, transiciones de estado, formateo, ciclos de descanso largo y lógica de autoStartBreaks.
  - `src/db/database.test.ts`: migración Dexie v2 → v3 comprobando persistencia de cuentas y transacciones.
**Archivos:** `src/db/types.ts`, `src/db/database.ts`, `src/lib/tasks.ts`, `src/lib/tasks.test.ts`, `src/lib/pomodoro.ts`, `src/lib/pomodoro.test.ts`, `src/db/database.test.ts`.
**Aceptación:** `npm run build`, `lint` y `test` pasan; 100 % de la lógica y la migración cubiertas sin interfaz gráfica.

### 4B — Pomodoro: Temporizador resiliente y control de sesión
- [x] Componente `PomodoroTimer` con selector de modalidad (Foco 25m, Descanso corto 5m, Descanso largo 15m), visor con números tabulares (`font-variant-numeric: tabular-nums`) y controles táctiles de 44×44 px.
- [x] Botón de icono de engranaje (⚙) accesible en la cabecera del timer que abre el sheet inferior de configuración (`PomodoroSettingsSheet`) para ajustar minutos de foco/descansos y el switch de auto-start de descansos.
- [x] Resiliencia a suspensión en iOS: listener de `visibilitychange` y `focus` que invoca la lógica de recálculo por timestamp al regresar al primer plano.
- [x] Helper defensivo de Screen Wake Lock (`src/lib/wakeLock.ts`): solicita mantener la pantalla encendida mientras el foco corre; se libera al pausar/completar o en caso de no estar soportado por el navegador/dispositivo.
- [x] Helper defensivo de Web Audio API (`src/lib/sound.ts`): reproduce un tono sintético suave al terminar la sesión sin depender de descargas ni archivos de audio (generado por código).
- [x] Guardado automático de la sesión en Dexie (`pomodoroSessions`) al completarse, vinculando la `taskId` activa.
- [x] Indicador visual del ciclo de 4 pomodoros hacia el descanso largo (`● ● ○ ○`).
- [x] Estilos con tokens de `DESIGN.md` (sin colores hardcodeados).
**Archivos:** `src/features/tasks/PomodoroTimer.tsx`, `src/features/tasks/PomodoroSettingsSheet.tsx`, `src/lib/wakeLock.ts`, `src/lib/wakeLock.test.ts`, `src/lib/sound.ts`, `src/lib/sound.test.ts`, `src/styles/index.css`.
**Aceptación:** el temporizador no se desfasa al bloquear y desbloquear el iPhone; guarda sesiones completadas en Dexie; solicita y libera Wake Lock limpiamente; icono de engranaje abre y guarda configuración; `npm run build`, `lint` y `test` pasan.

### 4C — Tareas: Lista, alta rápida y asignación de tarea actual
- [x] Componentes de lista de tareas (`TaskList`, `TaskItem`):
  - Checkbox táctil (hit area ≥44×44 px) para completar o desmarcar.
  - Título, badges discretos de prioridad de 3 niveles (Baja / Media / Alta) y fecha de vencimiento (hoy / mañana / fecha).
  - Contador de pomodoros completados en cada tarea (`2 pomodoros`).
  - Acción de 1 toque para marcar como "tarea actual" (`isCurrent: true`), reflejándose de inmediato en el Pomodoro.
  - Borrado lógico (`deletedAt`) con confirmación o Deshacer.
- [x] Bottom Sheet de alta y edición rápida (`TaskSheet`):
  - Input de título enfocado automáticamente.
  - Chips de selección de 3 prioridades (Baja / Media / Alta) y fecha de vencimiento.
  - Checkbox para fijar de inmediato como tarea actual.
- [x] Filtros rápidos por chip: "Pendientes" y "Completadas".
**Archivos:** `src/features/tasks/TaskList.tsx`, `src/features/tasks/TaskItem.tsx`, `src/features/tasks/TaskSheet.tsx`, `src/styles/index.css`.
**Aceptación:** crear una tarea toma 2 toques; selector de 3 prioridades funcional; marcar como actual actualiza el timer de inmediato; la lista responde con fluidez a una mano; `npm run build`, `lint` y `test` pasan.

### 4D — Integración de pantalla combinada, navegación e Inicio
- [ ] Vista combinada `TasksPage.tsx`: Pomodoro en bloque superior + Lista de tareas en bloque inferior en móvil (scroll fluido vertical); vista en 2 columnas en PC (≥1024px).
- [ ] Actualización de navegación (`src/components/ui/Navigation.tsx`):
  - Añadir ruta `'todo'` a `AppRoute`.
  - Cuarta pestaña en `BottomNav` etiquetada literalmente **"To do"** con objetivo táctil de 44 px.
  - Cuarto ítem en `SideNav` ("To do") para escritorio.
- [ ] Tarjeta de "Tarea actual" en `HomePage`:
  - Muestra la tarea actual, pomodoros completados hoy y botón directo "Iniciar foco" que redirige a `TasksPage`.
  - Si no hay tarea actual, muestra estado vacío con botón para elegir una.
- [ ] Verificación de responsive en móvil (390px) y escritorio (1024px), safe areas y reducción de movimiento.
**Archivos:** `src/components/ui/Navigation.tsx`, `src/features/tasks/TasksPage.tsx`, `src/App.tsx`, `src/features/finance/SummarySection.tsx` (o tarjeta en `HomePage`), `src/styles/index.css`.
**Aceptación:** flujo completo navegable entre Inicio y To do; acceso directo a foco desde Inicio; pestaña nombrada "To do"; sin regresiones en Finanzas; `npm run build`, `lint` y `test` pasan.

## Fase 5 — Pulido
- [ ] Hábitos, notas.
- [ ] Exportar/importar respaldo (JSON).
- [ ] Revisión final de rendimiento, accesibilidad y diseño.

## Reserva
Una sesión de Codex queda libre para imprevistos.

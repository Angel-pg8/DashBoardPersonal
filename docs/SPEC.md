# SPEC.md — Qué se construye

## Objetivo
App personal de uso diario que funciona sin internet en iPhone, sincroniza cuando hay conexión y también se usa en PC.

## Módulos
| Módulo | Fase | Estado |
|---|---|---|
| Base, diseño y PWA | 1 | pendiente |
| Finanzas (gastos, ingresos, categorías, presupuesto mensual, gráficas) | 2 | pendiente |
| Sincronización (login + nube) | 3 | pendiente |
| Tareas + Pomodoro | 4 | pendiente |
| Pulido: hábitos, notas, exportar/respaldar | 5 | pendiente |

## Pantallas
- **Inicio**: gastado del mes y presupuesto restante, tarea actual con acceso al Pomodoro, botón rápido "Agregar gasto".
- **Finanzas**: lista de movimientos (filtrar por mes y categoría), agregar/editar/borrar, resumen mensual, gráfica por categoría, presupuesto.
- **To do** (fase 4): pantalla combinada de uso diario (Tareas + Pomodoro). Temporizador Pomodoro en la parte superior con la tarea actual, icono de engranaje para ajustes y controles de foco/descanso; lista de tareas con 3 niveles de prioridad (baja, media, alta), alta rápida y acción de 1 toque para marcar la tarea activa en la parte inferior.
- **Más / Configuración**: franja de color (automático o fija), exportar datos, cuenta y sincronización (fase 3).

## Modelo de datos (borrador)
Campos comunes a todo registro: `id` (UUID), `createdAt`, `updatedAt`, `deletedAt?`, `synced`.

```ts
type Transaction = {
  id: string; type: 'income' | 'expense';
  amountCents: number;      // entero positivo
  categoryId: string;
  note?: string;
  date: string;             // ISO, fecha del movimiento
  createdAt: string; updatedAt: string; deletedAt?: string; synced: boolean;
};

type Category = {
  id: string; name: string; kind: 'income' | 'expense';
  icon?: string; sortOrder: number;
  createdAt: string; updatedAt: string; deletedAt?: string; synced: boolean;
};

type Budget = {
  id: string; month: string;        // 'YYYY-MM'
  categoryId?: string;              // vacío = presupuesto total del mes
  limitCents: number;
  createdAt: string; updatedAt: string; deletedAt?: string; synced: boolean;
};
```
Las tablas de tareas, sesiones de Pomodoro, hábitos y notas se agregan en sus fases.

## Requisitos transversales
- Funciona 100 % sin internet tras la primera carga.
- Instalable en la pantalla de inicio del iPhone.
- Moneda: dólar (USD), formato `$1,234.56`. [Pendiente confirmar]
- Idioma de la interfaz: español.
- Rendimiento: carga inicial rápida y interacciones sin tirones en iPhone.
- Accesibilidad: WCAG 2.2 AA.

## Fuera de alcance por ahora
Notificaciones push, múltiples usuarios, compartir datos, app nativa.

## Sincronización (fase 3, para tenerla en mente desde la fase 1)
Local primero. Cada cambio queda con `synced: false` hasta subirse. Conflictos: gana el `updatedAt` más reciente por registro; los borrados son lógicos (`deletedAt`) para poder propagarse.

## Finanzas — decisiones
- Moneda única: USD. Importes en centavos enteros; formato con Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }); dígitos con tabular-nums.
- Tipos de movimiento: gasto, ingreso, transferencia. Las transferencias solo mueven saldo entre cuentas.
- Disponible = presupuesto total − gastos del periodo. Disponible por día = disponible ÷ días restantes (mínimo 1).
- Sin rollover entre meses en v1.
- Se permite saldo negativo en cuentas tipo tarjeta.
- Borrado lógico (`deletedAt`); campo `synced` para la fase 3.
- Pestañas: Resumen, Movimientos, Presupuesto, Más (Cuentas, Recurrentes, Análisis, Categorías, Exportar) + botón central "+".
- Semántica de color: ingreso #5fd39a, gasto #ff6b81, alerta ámbar al 80 % del límite. Mantener contraste WCAG AA.
- Fuera de v1: metas de ahorro, deudas, adjuntos de recibos.

## Tareas + Pomodoro ("To do") — Especificación y decisiones

### 1. Alcance de la v1 (Mínimo Útil)
**Dentro de la v1:**
- **Tareas**:
  - Lista de tareas con dos estados: pendiente y completada.
  - Creación rápida (título obligatorio; prioridad de 3 niveles: baja, media o alta; fecha opcional: hoy, mañana o fecha específica).
  - Marcar una sola tarea como "actual" (`isCurrent: true`) con un solo toque; al marcar una, cualquier otra deja de ser la actual.
  - Editar título, prioridad y fecha.
  - Completar y desmarcar tareas mediante checkbox táctil (mínimo 44×44 px).
  - Borrado lógico (`deletedAt`) con confirmación o aviso con Deshacer.
  - Contador de pomodoros completados visible en cada tarea (derivado de las sesiones vinculadas).
  - Filtro simple por chip: "Pendientes" y "Completadas".
- **Pomodoro Timer**:
  - Tres modalidades de sesión: Foco (25 min por defecto), Descanso corto (5 min por defecto) y Descanso largo (15 min por defecto).
  - Ciclo clásico: tras 4 sesiones de foco se propone un descanso largo.
  - Ajustes mediante icono de engranaje (⚙) en la propia pantalla combinada: duraciones configurables (foco, descanso corto, descanso largo) y opción de iniciar descansos automáticamente (`autoStartBreaks: boolean`), guardadas en preferencias locales (`localStorage`).
  - Vinculación explícita con la tarea actual: muestra el título de la tarea en curso o permite elegir una de la lista.
  - Cálculo estricto por marcas de tiempo (`targetEndAt` y timestamps): inmune a la suspensión de iOS y pestañas inactivas. Al volver a primer plano (`visibilitychange` o `focus`) recalcula inmediatamente el tiempo transcurrido.
  - Registro automático en Dexie de cada sesión completada en `pomodoroSessions`, asociada al `taskId` activo.
  - Controles táctiles grandes (≥44×44 px): Iniciar, Pausar, Reanudar, Reiniciar, Saltar al siguiente modo.
  - Feedback sonoro sintético y limpio al finalizar la sesión mediante Web Audio API (0 KB, sin dependencias ni descarga de archivos de audio, generado por código).
  - Mantenimiento opcional de pantalla encendida mediante Screen Wake Lock API (`navigator.wakeLock`) con detección defensiva de soporte.
- **Navegación e integración con Inicio**:
  - Cuarta pestaña en la barra de navegación (`BottomNav` y `SideNav`) nombrada literalmente **"To do"**.
  - Tarjeta de "Tarea actual" en la pantalla de Inicio: título de la tarea, pomodoros completados hoy y botón directo "Iniciar foco" que conduce a la pantalla combinada con el timer listo.

**Fuera de la v1 (para después):**
- Notificaciones push o web notifications del sistema operativo.
- Estimación previa de pomodoros por tarea (ej. estimar 3 pomodoros y comparar contra reales).
- Subtareas o listas de verificación anidadas.
- Proyectos, carpetas, etiquetas múltiples o agrupaciones complejas.
- Estadísticas avanzadas, gráficas de productividad o mapa de calor histórico de pomodoros.
- Sonidos ambientales continuos (ruido blanco, lluvia, cafetería).
- Sincronización en la nube (se conectará en la Fase 3 con Supabase).

### 2. Pantallas y flujos

#### Pantalla combinada "To do" (Tareas + Pomodoro)
Combina en una sola vista el temporizador y la lista de tareas.
- **En iPhone (≤1023px, una mano)**:
  - Disposición vertical optimizada para el pulgar.
  - **Bloque superior (Hero de Pomodoro)**:
    - Encabezado con título de la vista y botón accesible de **icono de engranaje (⚙)** de 44×44 px para abrir el sheet de ajustes de Pomodoro (duraciones y auto-start de descansos).
    - Selector de modo con chips: Foco, Descanso corto, Descanso largo.
    - Dígitos del temporizador (`25:00`) grandes y prominentes, formateados con `font-variant-numeric: tabular-nums`.
    - Etiqueta de la tarea en curso: *"Trabajando en: [Título de tarea]"* con acceso a desvincular o cambiarla. Si no hay tarea seleccionada: *"Sin tarea activa — elige una de la lista"*.
    - Controles principales: botón de acento `--accent` de tamaño táctil amplio ("Iniciar foco" / "Pausar" / "Reanudar") y botones secundarios de reiniciar o saltar.
    - Indicador visual de ciclo: 4 marcas u octágonos sutiles que muestran el avance hacia el descanso largo (`● ● ○ ○`).
  - **Bloque inferior (Lista de tareas con scroll)**:
    - Encabezado con cantidad de tareas pendientes y botón rápido para añadir tarea.
    - Filtros por chip ("Pendientes", "Completadas").
    - Fila de tarea: checkbox accesible (área 44×44 px), título legible, badges discretos de prioridad (Baja / Media / Alta), fecha y contador de pomodoros (`2 pomodoros`).
    - Botón de 1 toque para "Hacer tarea actual" (icono/acción que la coloca de inmediato en el temporizador superior).
    - Sheet inferior de alta rápida: título enfocado automáticamente, selector de 3 prioridades por chips (Baja / Media / Alta), selector de fecha (Hoy / Mañana / Otra) y opción de activar como tarea actual al guardar.
- **En PC (≥1024px)**:
  - Navegación lateral en `side-rail` con el ítem "To do".
  - Disposición en dos columnas:
    - Columna izquierda: Hero de Pomodoro grande, engranaje de configuración, estado de la sesión, controles e indicadores.
    - Columna derecha: Gestión completa de la lista de tareas, filtros y alta rápida.

#### Tarjeta en pantalla de Inicio
- Ubicada junto al resumen del día.
- Si hay tarea actual: muestra el título, pomodoros completados hoy y botón "Iniciar foco" que salta directamente a la pantalla combinada.
- Si no hay tarea actual: mensaje accesible *"Sin tarea en curso"* con botón *"Elegir tarea"*.

#### Flujo del temporizador y suspensión en iOS (Regla crítica)
1. **Inicio de sesión**: Al presionar "Iniciar foco", se calcula `targetEndAt = Date.now() + durationMs` y se guarda la marca `startedAt` en formato ISO.
2. **Ejecución en primer plano**: Un intervalo simple (1 s) calcula `remainingMs = Math.max(0, targetEndAt - Date.now())` y refresca el texto en pantalla. Si Wake Lock está disponible, se solicita para evitar el bloqueo prematuro de pantalla.
3. **Pausa**: Si el usuario pausa, se congela el tiempo transcurrido acumulado (`elapsedMs`) y se cancela el `targetEndAt`. Al reanudar, se establece un nuevo `targetEndAt = Date.now() + (durationMs - elapsedMs)`.
4. **Suspensión en segundo plano (iOS)**: Si el usuario apaga la pantalla del iPhone o cambia de app, Safari suspende el hilo de JavaScript y congela `setInterval`. (Decisión aceptada: el Pomodoro se utilizará primordialmente en PC y en móvil con pantalla encendida o tiempo de espera indefinido).
5. **Reactivación**: Al desbloquear el iPhone o volver a la app, se escucha el evento `visibilitychange` (o `focus`). La función pura recalcula de inmediato:
   - Si `Date.now() < targetEndAt`: actualiza los segundos restantes reales sin desfase y reanuda el pulso visual.
   - Si `Date.now() >= targetEndAt`: detecta que la sesión concluyó mientras la app estaba suspendida. Marca la sesión como completada, guarda el registro en `pomodoroSessions`, reproduce el tono sintético de Web Audio API, avanza el modo sugerido y libera el Wake Lock.
   - Transición al descanso: si `autoStartBreaks` está activo en la configuración, inicia el descanso de inmediato; si está desactivado (por defecto), prepara el descanso en pausa y espera a que el usuario toque "Comenzar descanso".

### 3. Modelo de datos y migración en Dexie

#### Tipos TypeScript (`src/db/types.ts`)
```ts
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'completed'

export type Task = SyncFields & {
  title: string
  status: TaskStatus
  isCurrent: boolean
  priority: TaskPriority
  dueDate?: string        // Formato ISO 'YYYY-MM-DD'
  sortOrder: number
  completedAt?: string    // ISO 8601
}

export type PomodoroSessionType = 'focus' | 'shortBreak' | 'longBreak'

export type PomodoroSession = SyncFields & {
  taskId?: string         // Vinculado a Task.id si se corrió con tarea activa
  type: PomodoroSessionType
  durationSeconds: number // Segundos efectivos completados
  targetDurationSeconds: number
  startedAt: string       // ISO 8601
  endedAt: string         // ISO 8601
  completed: boolean
}

export type PomodoroSettings = {
  focusMinutes: number       // Predeterminado: 25
  shortBreakMinutes: number  // Predeterminado: 5
  longBreakMinutes: number   // Predeterminado: 15
  longBreakInterval: number  // Predeterminado: 4
  autoStartBreaks: boolean   // Predeterminado: false (configurable mediante icono de engranaje)
}
```

#### Migración del esquema de Dexie a versión 3 (`src/db/database.ts`)
Para no perder datos de las versiones 1 y 2, Dexie sube a `version(3)` conservando las definiciones de las tablas previas y agregando las nuevas:
```ts
// v3 agrega tareas y sesiones de pomodoro conservando íntegros los datos de v1 y v2
this.version(3).stores({
  accounts: 'id, name, kind, archived, updatedAt, deletedAt, synced',
  transactions: 'id, type, categoryId, accountId, transferAccountId, date, updatedAt, deletedAt, synced',
  categories: 'id, kind, name, [kind+name], sortOrder, updatedAt, deletedAt, synced',
  budgets: 'id, month, categoryId, updatedAt, deletedAt, synced',
  tasks: 'id, status, isCurrent, priority, dueDate, sortOrder, updatedAt, deletedAt, synced',
  pomodoroSessions: 'id, taskId, type, completed, startedAt, endedAt, updatedAt, deletedAt, synced',
})
```
- **Compatibilidad**: Todas las tablas existentes permanecen intactas. No hay transformaciones destructivas de datos.
- **Sincronización**: Tanto `Task` como `PomodoroSession` extienden `SyncFields` (`id`, `createdAt`, `updatedAt`, `deletedAt`, `synced: false`), quedando listos para la sincronización con Supabase de la Fase 3.
- **Preferencias de Pomodoro**: Las duraciones y la opción `autoStartBreaks` se almacenan como preferencia local liviana en `localStorage` (`dashboard-pomodoro-settings`), ajustables desde el icono de engranaje en la pantalla "To do".
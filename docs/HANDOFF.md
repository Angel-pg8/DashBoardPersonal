# Handoff

## Estado actual

- **Fase 4C completada — Tareas: Lista, alta rápida y asignación de tarea actual (23-nov)**:
  - Componente `TaskItem`: fila de tarea con checkbox táctil accesible (≥44×44 px), título legible (tachado en completada), badges de prioridad de 3 niveles con símbolos y texto explícito (`▲ Alta`, `▬ Media`, `▼ Baja`) aptos para daltónicos, fecha relativa (`formatTaskDueDate`: Hoy, Mañana, D/M) y contador de pomodoros vinculados.
  - Acción de 1 toque para fijar tarea actual (`isCurrent: true`) con icono de llama (`Flame`) y badge "Actual".
  - Edición y borrado lógico (`deletedAt`) con confirmación segura.
  - Componente `TaskSheet`: bottom sheet para alta y edición rápida con autofocus en el título, selector de 3 prioridades, chips de fecha rápida (Hoy/Mañana/Sin fecha/Otra con date input) y toggle para fijar como tarea actual.
  - Componente `TaskList`: filtros por chip para "Pendientes" y "Completadas" con contadores, botón destacado de "Nueva tarea" y estados vacíos claros.
  - Helper puro `formatTaskDueDate` añadido en `src/lib/tasks.ts` con prueba unitaria (89 pruebas pasando en total).
- **Fase 4B completada — Pomodoro: Temporizador resiliente y control de sesión (23-nov)**:
  - Componente `PomodoroTimer` con selector de modalidad (Foco, Descanso corto, Descanso largo), dígitos tabulares (`font-variant-numeric: tabular-nums`) grandes, controles táctiles (≥44×44 px) de inicio/pausa/reanudación/reinicio/salto, e indicador de 4 pomodoros hacia el descanso largo (`● ● ○ ○` con texto accesible).
  - Configuración mediante engranaje (⚙) en cabecera con sheet inferior `PomodoroSettingsSheet`: duraciones ajustables y auto-start de descansos, persistidos en `localStorage` con fallback seguro a defaults.
  - Resiliencia ante suspensión en iOS mediante listeners de `visibilitychange` y `focus` que recalculan de inmediato por marcas de tiempo (`targetEndAt`).
  - Helper defensivo de Screen Wake Lock (`src/lib/wakeLock.ts`) con solicitud en foco y liberación al pausar/completar o en entornos sin soporte.
  - Helper defensivo de Web Audio API (`src/lib/sound.ts`) con oscilador sintético de doble tono (~587Hz -> ~880Hz) sin archivos de audio externos.
  - Registro automático en Dexie de sesiones completadas (`db.pomodoroSessions`) con vínculo a la tarea actual si está activa.
  - 6 nuevas pruebas unitarias añadidas (88 pruebas pasando en total).
- **Fase 4A completada — Datos, tipos y lógica pura (23-nov)**: Esquema Dexie v3 implementado con migración declarativa sin pérdida de datos v1 ni v2 (`tasks` y `pomodoroSessions`). Tipos `Task`, `PomodoroSession`, `PomodoroSettings`, `TaskPriority` ('low' | 'medium' | 'high'), `TaskStatus`, `PomodoroSessionType`. Lógica pura de tareas en `src/lib/tasks.ts` y lógica pura de Pomodoro en `src/lib/pomodoro.ts` (cálculo inmune a suspensión de iOS con marcas de tiempo `targetEndAt`, pausas acumuladas sin desfase, salto temporal simulado de 25 min, ciclos de 4 pomodoros y `autoStartBreaks`). 21 nuevas pruebas unitarias añadidas (82 pruebas en total pasando).
- **Iconos en la barra de navegación integrados con Lucide (23-nov)**: Reemplazo de los puntos huecos en `BottomNav` y `SideNav` por iconos semánticos offline (`LayoutDashboard` para Inicio, `Wallet` para Finanzas, `Ellipsis` para Más) desde `lucide-react`. Tamaño 24px, strokeWidth uniforme de 2 y color con `currentColor`. Estado activo diferenciado de forma accesible sin depender solo del color (peso tipográfico 750 vs 500, opacidad y píldora indicadora `.nav-item__indicator` animada únicamente con `transform`/`opacity`). Accesibilidad garantizada con `aria-label`, `aria-current="page"`, `aria-hidden="true"` en iconos, hit area mínima de 44×44 px y safe areas de iOS respetadas. 4 pruebas unitarias añadidas (61 pruebas en total).
- **Planificación de la Fase 4 — Tareas + Pomodoro ("To do") completada y ajustada con decisiones de usuario (23-nov)**: Especificación funcional, técnica y modelo de datos documentados en `docs/SPEC.md`; decisiones registradas en `docs/DECISIONS.md` (pestaña "To do", engranaje de configuración en pantalla, 3 niveles de prioridad Baja/Media/Alta, Web Audio API sintético, autoStartBreaks configurable y aceptación de suspensión en iOS); desglose en 4 subfases modulares y committeables (4A a 4D) con criterios de aceptación en `docs/TASKS.md`. Listo para arrancar la implementación en 4A sin tocar código en esta sesión.
- Pantalla de carga (splash) implementada (23-nov): HTML y CSS inline en `index.html` con fondo `#050505`, logo SVG blanco centrado inline, animación de pulso suave (solo transform/opacity), respeto a `prefers-reduced-motion`, ocultamiento con fade de 250 ms y mínimo visible de 350 ms activado desde `src/main.tsx` mediante `dismissSplash()`, y eliminación limpia del DOM. 9 pruebas unitarias añadidas (57 pruebas en total).
- Logo de marca actualizado (17-nov): `public/nuevos-logos/` es la fuente; los iconos PWA, favicon y apple-touch se regeneran con `npm run generate-pwa-assets`. El detalle hexagonal pasó a octágono. Ver `docs/DECISIONS.md`.
- Fase en curso: 2B-1 — período, presupuesto y resumen.
- Bloques 2A-1 a 2A-3 cerrados (ver commits `75df3ef`, 2A-2, `3ca3aba`).
- Pulido de Finanzas cerrado (`fix(finance)`): 
  - Los chips y demás botones no envían el formulario por accidente: `Chip`, `IconButton`, `Tabs` y `Button` usan `type="button"` por defecto; solo "Guardar…" y "Guardar y añadir otro" envían.
  - Herencia de fuente consolidada en la base de estilos: `button, input, select, textarea { font: inherit }`.
  - El sheet congela el scroll del fondo (truco `position: fixed` en `body` para Safari iOS, restaurado al cerrar, incluso por error) y usa `overscroll-behavior: contain` en su contenido.
  - El sheet se cierra arrastrando la muesca hacia abajo (umbral en `src/lib/sheet.ts`, animación con `transform`), tocando la muesca o el fondo; con borrador sin guardar pide confirmación y al descartar limpia el formulario. Los cierres tienen animación de salida (200 ms, solo `transform`/`opacity`).
  - El toast con Deshacer se cierra solo a los ~6 s con barra de progreso (`transform: scaleX`), se pausa mientras se mantiene presionado y un aviso nuevo reemplaza al anterior (componente `src/components/ui/Toast.tsx`, timing en `src/lib/toast.ts`).
  - "Guardar y añadir otro" limpia monto y nota, sube el scroll del sheet y vuelve a enfocar el monto (teclado numérico), conservando tipo, cuenta y fecha.
  - En Inicio, "Agregar gasto" abre el sheet de registro (estado del sheet elevado a `App`); ya no está deshabilitado.
- **Bloque 1 completado**: Header duplicado en móvil arreglado (ocultar `.side-rail` en móvil), logo hexágono reemplazado por SVG blanco (`/logo-white.svg`). Commit `518b20b`.
- **Bloque 2 completado**: "Disponible" en Resumen ahora usa saldo real de cuentas (`totalActiveAccountBalanceCents`: saldo inicial + ingresos − gastos ± transferencias) en lugar del cálculo basado en presupuesto. El texto "por día" muestra "Sin margen para este período" cuando disponible ≤ 0. Agregadas 6 pruebas Vitest (solo ingresos, ingresos y gastos, saldo negativo, último día del período, días restantes = 0). Commit `6a0aa1d`.
- **Bloque 3 completado**: Revisión visual a 390px con Impeccable/Taste. Cambios:
  - `.chip` `min-height: 36px → 44px` (touch target AA).
  - `.budget-total` y `.budget-row__header` agregan `flex-wrap: wrap` para no desbordar en 390px.
  - Padding de chip ajustado a `.5rem .875rem` para mejor hit area.
  - Contraste verificado: todos los tokens cumplen AA (muted/soft/line, income/expense, accent por tono).
  - Jerarquía tipográfica `clamp()` y `tabular-nums` intacta. Espaciado coherente.
  - Commit `f7773ad`.
- **Regresiones post-Bloque 1/3 corregidas** (sesión 13-nov):
  - **A. Barra lateral desaparecida en escritorio** — causa: `.side-rail { display: none }` quedó en la base CSS (se aplicaba a todas las anchuras) y el media query `≥1024px` no restauraba `display`. Corrección: `display: block` dentro de `@media (min-width: 1024px)`. Commit `36b539b`. Este commit también arrastró una actualización pendiente de HANDOFF de la sesión anterior (documental).
  - **B. Logo no cargaba** — causa: `<img src="/logo-white.svg">` era ruta absoluta; con base `/DashBoardPersonal/` (GitHub Pages) resolvía fuera de la subruta (404). Corrección: `${import.meta.env.BASE_URL}logo-white.svg` en ambos headers + `width/height={30}` fijos + `alt=""`/`aria-hidden` (el texto "Ángel" es el nombre accesible). Se creó `src/vite-env.d.ts` (`/// <reference types="vite/client" />`) para tipar `import.meta.env`. Commit `48d0c45`.
  - Selectores muertos `.brand__hex` eliminados (el hexágono decorativo sigue vivo en `empty-state__hex`; el de Inicio pasó al bloque "Disponible.", ver abajo).
- No hay trabajo pendiente sin confirmar en este punto.

## Pulido visual móvil (13-nov, segunda sesión)

Revisión con Impeccable/Taste (dial de movimiento bajo) y aplicación solo de arreglos claros; un commit por pantalla, cada uno con lint + build + test en verde:

- `b8250dc` polish(nav): FAB de 56px abajo a la derecha (acento, sin sombra) para abrir el sheet en Inicio y Finanzas ≤1023px; los botones "Agregar gasto" del header y de summary-actions quedan ocultos en móvil vía CSS; ≥1024px sin FAB (botón del header + side nav). Toast con objetivos táctiles de 44px ("Deshacer" 78×44, cierre 25×44) y colocado sobre el FAB; `.main` con padding inferior en móvil para que el FAB no tape contenido.
- `5c5b09a` polish(home): hexágono de marca detrás del bloque "Disponible." solo en Inicio (`.page--home .summary-available::before`, estático, opacidad .14); aire superior en ≤420px (`.page__title` 2.8rem → 1.9rem); CSS muerto eliminado (`.home-hero`, `.eyeless-label`).
- `be67b2b` polish(summary): disponible negativo se tiñe con `--color-expense` (`.summary-value--negative`); `tabular-nums` en `.summary-alert`; flex-wrap en `.finance-section-header`.
- `11adfbc` polish(movements): las 4 pestañas de Finanzas caben a 390px (gap 0 y padding reducido ≤420px).
- `eac0439` polish(budget): warning legible sin depender solo del color ("Quedan $X. Cerca del límite."); tabular en `.budget-row small`.
- `ff1d460` polish(accounts): EmptyState consistente en Cuentas y confirmación al archivar (`window.confirm`).
- `f33752e` polish(finance): botones de encabezado a la derecha (`.finance-section-header .button { margin-left: auto }`); `.finance-month` 11rem → 13rem para no truncar "noviembre de 2026".
- `e194557` polish(home): hexágono contenido tras la cifra (top -58, right -44, no cruza el copy) y copy ámbar en SummarySection con palabras ("Quedan $X. Cerca del límite.").
- `88f0102` polish(movements): mayúscula solo en la inicial de la fecha del día ("Viernes, 13 de noviembre", ya no "De Noviembre").

**Tradeoff documentado**: al guardar un gasto desde Inicio la app vuelve a Inicio y el toast con Deshacer (lo dibuja FinancePage) no se ve allí; la confirmación queda en "Últimos movimientos" de Inicio. Guardando desde Finanzas sí se ve el toast (verificado en vivo: aparece sobre el sheet incluso con "Guardar y añadir otro", z-index 30 sobre el backdrop 20, botones de 44px medidos).

### Verificación con capturas (arnés de iframes + browser real, 13-nov)

| Ancho | Vistas verificadas | overflowX |
|---|---|---|
| 390 | Inicio (hexágono, ámbar, FAB), Finanzas Resumen/Movimientos/Presupuesto/Cuentas, sheet con scroll hasta acciones, disponible negativo en rojo (−$110.50 con "Sin margen para este periodo."), toast sobre el sheet con botones de 44px | 0 |
| 768 | Inicio, Resumen, Presupuesto | 0 |
| 1280 | Inicio, Resumen, Movimientos, Presupuesto, Cuentas (zoom 0.71 en el arnés), FAB oculto (`display: none`) y side rail visibles | 0 |

- Consola sin errores en todas las pasadas; sin desbordes ni elementos duplicados.
- Comportamiento tras guardar verificado en vivo: desde Inicio vuelve a Inicio; con "Guardar y añadir otro" se queda en Finanzas, sheet abierto, monto limpio y toast visible.
- Limpieza al cerrar: los movimientos de prueba ($1,200 + cuatro de $1 en Ahorro) se borraron de la DB dev vía Dexie y el arnés temporal (`public/arnes.html`) se eliminó sin haber entrado jamás en un commit; `npm run build` vuelve a 24 entradas de precache.

## Avance de 2B-1

- Paso 1 cerrado: la lógica pura de período financiero, presupuestos y resumen está en `src/lib/period.ts` y `src/lib/budget.ts`, con pruebas para días 29/30/31, cambio de año, límites y transferencias.
- Movimientos y Presupuesto ya resuelven el mismo período mediante una única función compartida.
- Último commit estable de implementación: `e4358e1` (`feat(finance): add configurable budget period logic`).

- Paso 2 cerrado: Finanzas tiene pestañas para Movimientos, Presupuesto y Cuentas. Presupuesto permite cambiar el día de inicio, editar total y límites por categoría, ver el estado de cada límite y copiar los valores activos del período anterior.
- Último commit estable de implementación: `af74f6a` (`feat(finance): add budget controls and period setting`).

## Plan de Implementación Fase 4 (Tareas + Pomodoro) — Paso 1: PLANEAR

### Subfases pendientes identificadas
- **Fase 4A**: Completada y verificada en sesión previa (esquema Dexie v3 con pruebas de migración v1/v2 intactos, tipos en `src/db/types.ts`, lógica pura en `src/lib/tasks.ts` y `src/lib/pomodoro.ts` con 21 pruebas unitarias pasando, total 82 pruebas).
- **Fase 4B (Pendiente)**: Pomodoro: Temporizador resiliente y control de sesión.
- **Fase 4C (Pendiente)**: Tareas: Lista, alta rápida y asignación de tarea actual.
- **Fase 4D (Pendiente)**: Integración de pantalla combinada, navegación e Inicio.

### Orden de ejecución
1. **Fase 4B**: Pomodoro Timer + Wake Lock + Sonido sintético Web Audio API + Sheet de configuración.
2. **Fase 4C**: Componentes de Tareas (`TaskItem`, `TaskList`, `TaskSheet`) con checkbox táctil, prioridades accesibles y tarea actual.
3. **Fase 4D**: Integración completa en `TasksPage`, 4.ª pestaña "To do" en `Navigation`, tarjeta en `HomePage` y ajustes responsive.

### Archivos por subfase
- **4B**:
  - `src/lib/wakeLock.ts` y `src/lib/wakeLock.test.ts`
  - `src/lib/sound.ts` y `src/lib/sound.test.ts`
  - `src/features/tasks/PomodoroTimer.tsx`
  - `src/features/tasks/PomodoroSettingsSheet.tsx`
  - `src/styles/index.css`
- **4C**:
  - `src/features/tasks/TaskItem.tsx`
  - `src/features/tasks/TaskList.tsx`
  - `src/features/tasks/TaskSheet.tsx`
  - `src/styles/index.css`
- **4D**:
  - `src/features/tasks/TasksPage.tsx`
  - `src/components/ui/Navigation.tsx` y `src/components/ui/Navigation.test.ts`
  - `src/features/tasks/CurrentTaskCard.tsx`
  - `src/App.tsx`
  - `src/styles/index.css`

### Riesgos identificados y mitigación
1. **Migración de Dexie preservando Finanzas**:
   - *Riesgo*: Corrupción o pérdida de tablas `accounts`, `transactions`, `categories`, `budgets`.
   - *Mitigación*: El esquema v3 ya está definido declarativamente y verificado con prueba unitaria en `src/db/database.test.ts` que simula una base de datos v2 con cuentas y transacciones y valida su permanencia intacta tras migrar a v3.
2. **Suspensión del temporizador en iOS**:
   - *Riesgo*: `setInterval` se congela cuando Safari pasa a segundo plano o se apaga la pantalla, provocando desvíos en el tiempo restante.
   - *Mitigación*: El tiempo se basa exclusivamente en marcas de tiempo (`targetEndAt = now + remainingMs`). Los listeners de `visibilitychange` y `focus` llaman de inmediato a `evaluateTimer(state, settings, Date.now())` al volver a primer plano para recalcular o completar la sesión sin desfase.
3. **Bloqueo de Web Audio API en Safari iOS**:
   - *Riesgo*: AudioContext bloqueado si no hay interacción previa del usuario.
   - *Mitigación*: Desbloqueo silencioso o reanudación del AudioContext en el evento click/touch de inicio del temporizador.
4. **Soporte dispar de Screen Wake Lock**:
   - *Riesgo*: Falla en navegadores que no lo soportan o rechazo de permisos.
   - *Mitigación*: Verificación `'wakeLock' in navigator` y captura defensiva con `try/catch`.
5. **Accesibilidad para daltonismo**:
   - *Riesgo*: Dependencia exclusiva de color para estados y prioridades.
   - *Mitigación*: Prioridades etiquetadas con texto ("Baja", "Media", "Alta") y distintivos de forma; números tabulares; estados del temporizador con etiquetas explícitas.

### Decisiones tomadas por el agente para preguntas abiertas
1. **Icono de navegación para "To do"**: Usar `ListTodo` de `lucide-react` para la 4.ª pestaña en `BottomNav` y `SideNav`.
2. **Sonido de finalización de Pomodoro**: Generador de tono sintético mediante Web Audio API en `src/lib/sound.ts` (tono de dos notas limpias ~587Hz y ~880Hz con envolvente suave en 300 ms, 0 dependencias externas).
3. **Screen Wake Lock**: Solicitud automática solo mientras el temporizador está en estado `'running'` y fase `'focus'`. Liberación automática al pausar, terminar, saltar fase o desmontar el componente.
4. **Almacenamiento de configuración de Pomodoro**: `localStorage` bajo la clave `'dashboard-pomodoro-settings'` usando `PomodoroSettings`, con fallback seguro a `DEFAULT_POMODORO_SETTINGS`.
5. **Borrado de tareas**: Borrado lógico (`deletedAt`) con diálogo nativo `window.confirm` para confirmación inmediata sin dependencias adicionales.

### Verificación de criterios de aceptación
- `npm run test` (pruebas de wakeLock, sound, timer, tareas, navegación y migración).
- `npm run lint` (ESLint estricto sin errores ni warnings).
- `npm run build` (TypeScript estricto y Vite build limpio con assets de PWA intactos).
- Verificación manual conceptual de responsive (390px vs 1024px), safe areas y controles >= 44x44 px.

## Siguiente fase

- **Fase 4C — Tareas: Lista, alta rápida y asignación de tarea actual**:
  - Componentes `TaskItem`, `TaskList` y `TaskSheet`.
  - Checkbox táctil (≥44×44 px) para completar/desmarcar tareas.
  - Título, badges discretos de prioridad de 3 niveles (Baja/Media/Alta) legibles sin depender solo del color, fecha y contador de pomodoros.
  - Acción de 1 toque para asignar tarea actual (`isCurrent: true`).
  - Borrado lógico (`deletedAt`) con confirmación.
  - Sheet inferior de alta y edición rápida (`TaskSheet`) con autofocus y chips de prioridad/fecha.
  - Filtros por chip ("Pendientes" y "Completadas").

## Verificación

```text
npm run test    # 88 pruebas
npm run lint
npm run build
```

### Verificación de las regresiones (13-nov, con `npm run preview` y browser real)

Base de preview: `/DashBoardPersonal/`. Arnés de iframes a 390/768/1280 px (media queries evaluadas dentro de cada frame). Resultados con `getComputedStyle`:

| Ancho | `.side-rail` | `.mobile-brand` | `.bottom-nav` | `.side-nav` | Logo |
|---|---|---|---|---|---|
| 390 | `none` | `flex` | `grid` | `none` | 200 ✓ |
| 768 | `none` | `flex` | `grid` | `none` | 200 ✓ |
| 1280 | `block` | `none` | `none` | `grid` | 200 ✓ |

- Logo: `naturalWidth > 0`, `currentSrc = /DashBoardPersonal/logo-white.svg`, HTTP 200, consola sin errores.
- Service worker: `dist/sw.js` incluye `logo-white.svg` en `precacheAndRoute` (carga sin conexión).
- Capturas de pantalla revisadas a los tres anchos (una sola barra de marca visible en cada uno).

## Pruebas manuales pendientes

- En iPhone y PC: verificar los nuevos iconos en la barra de navegación (Inicio con LayoutDashboard, Finanzas con Wallet, Más con Ellipsis). Confirmar que el estado activo se distingue nítidamente sin depender solo del color (píldora indicadora visible en móvil, texto en negrita y opacidad completa). Verificar que el área táctil responde cómodamente (mínimo 44×44 px) y que la barra inferior respeta la safe area del iPhone sin solapar con la barra de inicio ni con el FAB.
- En iPhone y PC: abrir la app (en frío o recargando) y verificar que aparece de inmediato la pantalla splash con fondo negro (#050505), el logo blanco centrado pulsando suavemente, sin parpadeos, y desaparece con un fade suave (~250 ms) revelando la interfaz una vez montada la app.
- En iPhone con "Reducir movimiento" activado: confirmar que el logo no pulsa y la transición de salida es limpia.
- En iPhone en modo avión / sin conexión: verificar que la pantalla de carga se muestra y funciona de forma idéntica gracias a estar inline en el HTML.
- En PC (≥1024px): confirmar que la barra lateral con el logo blanco y el menú Inicio/Finanzas/Más se ve (regresión corregida en `36b539b`); y que no aparece header sobre el contenido.
- En iPhone (390px): confirmar un solo header con el logo y que la barra inferior no se duplique; girar a landscape y repetir.
- En iPhone sin conexión: abrir la app y verificar que el logo sigue visible (precache del SW) tras haberla usado con conexión antes.
- En iPhone y PC, crear, editar y archivar cuentas; comprobar que el saldo responde a ingresos, gastos y transferencias.
- Registrar un gasto desde Finanzas: monto, categoría, cuenta, fecha Hoy/Ayer/Otra y nota; usar "Guardar y añadir otro" y "Deshacer".
- Probar una transferencia entre dos cuentas y un saldo inicial negativo de tarjeta.
- Crear movimientos en dos días y meses distintos; revisar subtotal diario, selector de mes, búsqueda y los filtros de categoría, cuenta y tipo.
- Editar un movimiento y borrarlo; usar Deshacer para comprobar que vuelve a aparecer y afecta de nuevo el saldo.
- Repetir lo anterior sin conexión y cerrar/abrir la app para confirmar la persistencia local.
- En iPhone: tocar chips de categoría/fecha dentro del sheet y verificar que no se envía nada; solo "Guardar" envía.
- En iPhone: con el sheet abierto, intentar desplazar el fondo (debe quedar fijo) y hacer scroll dentro del sheet sin que el fondo se mueva.
- En iPhone: arrastrar la muesca hacia abajo para cerrar; pasar el umbral cierra, soltar antes vuelve; tocar la muesca o el fondo cierra; con datos escritos debe pedir confirmación y no perderlos por accidente.
- En iPhone: verificar que el aviso con Deshacer desaparece a los ~6 s, con la barra que se vacía; mantenerlo presionado lo pausa; un aviso nuevo reemplaza al anterior.
- En iPhone: "Guardar y añadir otro" debe dejar el monto enfocado con teclado numérico, scroll arriba y cuenta/fecha conservadas.
- Desde Inicio, "Agregar gasto" abre el sheet de registro directamente (en móvil, con el FAB abajo a la derecha).
- En iPhone: comprobar que el FAB queda al alcance del pulgar y que el padding inferior de las pantallas deja ver el final de cada lista.
- Guardar un gasto desde Inicio y confirmar que vuelve a Inicio y que el movimiento aparece en "Últimos movimientos" (el toast con Deshacer solo se ve guardando desde Finanzas; es el tradeoff documentado arriba).
- Con "Guardar y añadir otro", ver que el toast aparece por encima del sheet y que sus botones se pueden tocar.
- Con "Reducir movimiento" activado en iOS, verificar que las animaciones son mínimas y el aviso sigue cerrándose solo a los 6 s.
- En iPhone y PC, cambiar el día de inicio del período (incluido 29, 30 y 31) y verificar que Movimientos y Presupuesto muestran el mismo rango de fechas.
- Definir presupuesto total y de categoría, probar el aviso ámbar al 80 %, el rojo al superar el límite y un límite de $0. Copiar el período anterior y verificar los importes.

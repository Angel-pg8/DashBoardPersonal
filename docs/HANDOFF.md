# Handoff

## Estado actual

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

## Siguiente fase

Completar el paso 3 de 2B-1: resumen en Inicio y en Finanzas. **Todos los 3 bloques completados** y regresiones corregidas.

## Verificación

```text
npm run test    # 48 pruebas
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

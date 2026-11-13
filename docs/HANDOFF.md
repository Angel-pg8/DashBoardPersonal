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
- No hay trabajo pendiente sin confirmar en este punto.

## Avance de 2B-1

- Paso 1 cerrado: la lógica pura de período financiero, presupuestos y resumen está en `src/lib/period.ts` y `src/lib/budget.ts`, con pruebas para días 29/30/31, cambio de año, límites y transferencias.
- Movimientos y Presupuesto ya resuelven el mismo período mediante una única función compartida.
- Último commit estable de implementación: `e4358e1` (`feat(finance): add configurable budget period logic`).

- Paso 2 cerrado: Finanzas tiene pestañas para Movimientos, Presupuesto y Cuentas. Presupuesto permite cambiar el día de inicio, editar total y límites por categoría, ver el estado de cada límite y copiar los valores activos del período anterior.
- Último commit estable de implementación: `af74f6a` (`feat(finance): add budget controls and period setting`).

## Siguiente fase

Completar el paso 3 de 2B-1: resumen en Inicio y en Finanzas. **Todos los 3 bloques completados**.

## Verificación

```text
npm run test    # 48 pruebas
npm run lint
npm run build
```

## Pruebas manuales pendientes

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
- Desde Inicio, "Agregar gasto" abre el sheet de registro directamente.
- Con "Reducir movimiento" activado en iOS, verificar que las animaciones son mínimas y el aviso sigue cerrándose solo a los 6 s.
- En iPhone y PC, cambiar el día de inicio del período (incluido 29, 30 y 31) y verificar que Movimientos y Presupuesto muestran el mismo rango de fechas.
- Definir presupuesto total y de categoría, probar el aviso ámbar al 80 %, el rojo al superar el límite y un límite de $0. Copiar el período anterior y verificar los importes.

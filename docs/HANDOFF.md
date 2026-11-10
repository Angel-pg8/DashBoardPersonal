# Handoff

## Estado actual

- Fase en curso: 2B-1 — período, presupuesto y resumen.
- Bloques 2A-1 a 2A-3 cerrados (ver commits `75df3ef`, 2A-2, `3ca3aba`).
- Pulido de Finanzas cerrado (`fix(finance)`): 
  - Los chips y demás botones no envían el formulario por accidente: `Chip`, `IconButton`, `Tabs` y `Button` usan `type="button"` por defecto; solo "Guardar…" y "Guardar y añadir otro" envían.
  - Herencia de fuente consolidada en la base de estilos: `button, input, select, textarea { font: inherit }`.
  - El sheet congela el scroll del fondo (truco `position: fixed` en `body` para Safari iOS, restaurado al cerrar, incluso por error) y usa `overscroll-behavior: contain` en su contenido.
  - El sheet se cierra arrastrando la muesca hacia abajo (umbral en `src/lib/sheet.ts`, animación con `transform`), tocando la muesca o el fondo; con borrador sin guardar pide confirmación y, al descartar, limpia el formulario. Los cierres tienen animación de salida (200 ms, solo `transform`/`opacity`).
  - El toast con Deshacer se cierra solo a los ~6 s con barra de progreso (`transform: scaleX`), se pausa mientras se mantiene presionado y un aviso nuevo reemplaza al anterior (componente `src/components/ui/Toast.tsx`, timing en `src/lib/toast.ts`).
  - "Guardar y añadir otro" limpia monto y nota, sube el scroll del sheet y vuelve a enfocar el monto (teclado numérico), conservando tipo, cuenta y fecha.
  - En Inicio, "Agregar gasto" abre el sheet de registro (estado del sheet elevado a `App`); ya no está deshabilitado.
- No hay trabajo pendiente sin confirmar en este punto.

## Avance de 2B-1

- Paso 1 cerrado: la lógica pura de período financiero, presupuestos y resumen está en `src/lib/period.ts` y `src/lib/budget.ts`, con pruebas para días 29/30/31, cambio de año, límites y transferencias.
- El filtro de movimientos ya resuelve el período mediante una única función compartida; la interfaz todavía conserva el inicio de mes en 1 hasta el siguiente paso.
- Último commit estable de implementación: se registrará al cerrar este paso.

## Siguiente fase

Completar el paso 2 de 2B-1: pantalla de Presupuesto y ajuste local del día de inicio del período. Después, el paso 3 agrega el resumen en Inicio y Finanzas. No empezar 2B-2.

## Verificación

```text
npm run test    # 42 pruebas
npm run lint
npm run build
```

## Pruebas manuales pendientes

- En iPhone y PC, crear, editar y archivar cuentas; comprobar que el saldo responde a ingresos, gastos y transferencias.
- Registrar un gasto desde Finanzas: monto, categoría, cuenta, fecha Hoy/Ayer/Otra y nota; usar “Guardar y añadir otro” y “Deshacer”.
- Probar una transferencia entre dos cuentas y un saldo inicial negativo de tarjeta.
- Crear movimientos en dos días y meses distintos; revisar subtotal diario, selector de mes, búsqueda y los filtros de categoría, cuenta y tipo.
- Editar un movimiento y borrarlo; usar Deshacer para comprobar que vuelve a aparecer y afecta de nuevo el saldo.
- Repetir lo anterior sin conexión y cerrar/abrir la app para confirmar la persistencia local.
- En iPhone: tocar chips de categoría/fecha dentro del sheet y verificar que no se envía nada; solo “Guardar” envía.
- En iPhone: con el sheet abierto, intentar desplazar el fondo (debe quedar fijo) y hacer scroll dentro del sheet sin que el fondo se mueva.
- En iPhone: arrastrar la muesca hacia abajo para cerrar; pasar el umbral cierra, soltar antes vuelve; tocar la muesca o el fondo cierra; con datos escritos debe pedir confirmación y no perderlos por accidente.
- En iPhone: verificar que el aviso con Deshacer desaparece a los ~6 s, con la barra que se vacía; mantenerlo presionado lo pausa; un aviso nuevo reemplaza al anterior.
- En iPhone: “Guardar y añadir otro” debe dejar el monto enfocado con teclado numérico, scroll arriba y cuenta/fecha conservadas.
- Desde Inicio, “Agregar gasto” abre el sheet de registro directamente.
- Con “Reducir movimiento” activado en iOS, verificar que las animaciones son mínimas y el aviso sigue cerrándose solo a los 6 s.

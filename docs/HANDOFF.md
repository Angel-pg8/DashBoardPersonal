# Handoff

## Estado actual

- Fase cerrada: 2A — Finanzas: núcleo.
- Bloque 2A-1 cerrado en `75df3ef`.
- Bloque 2A-2 cerrado: cuentas locales con saldo calculado, y registro rápido offline de gasto, ingreso y transferencia. El saldo inicial admite valores negativos para tarjetas.
- Bloque 2A-3 cerrado: lista de movimientos agrupada por día, con subtotal, selector de mes, búsqueda, filtros, edición y borrado lógico recuperable mediante Deshacer.
- Último commit estable de implementación: `3ca3aba` (`feat(finance): add movement management`).
- No hay trabajo pendiente sin confirmar en este punto.

## Siguiente fase

Fase 2B — Finanzas: control. No se ha iniciado: presupuesto, resumen, recurrentes, análisis y CSV siguen pendientes.

## Verificación

```text
npm run test    # 24 pruebas
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

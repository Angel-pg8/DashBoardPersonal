# Handoff

## Estado actual

- Fase activa: 2A — Finanzas: núcleo.
- Bloque 2A-1 cerrado en `75df3ef`.
- Bloque 2A-2 cerrado: cuentas locales con saldo calculado, y registro rápido offline de gasto, ingreso y transferencia. El saldo inicial admite valores negativos para tarjetas.
- Último commit estable de implementación: se registrará al cerrar este bloque.
- No hay trabajo pendiente sin confirmar en este punto.

## Siguiente bloque

Completar 2A-3: lista de movimientos agrupada por día con subtotales, selector de mes, búsqueda, filtros por categoría/cuenta/tipo, edición y borrado lógico. No adelantar 2B.

## Verificación

```text
npm run test    # 21 pruebas
npm run lint
npm run build
```

## Pruebas manuales pendientes

- En iPhone y PC, crear, editar y archivar cuentas; comprobar que el saldo responde a ingresos, gastos y transferencias.
- Registrar un gasto desde Finanzas: monto, categoría, cuenta, fecha Hoy/Ayer/Otra y nota; usar “Guardar y añadir otro” y “Deshacer”.
- Probar una transferencia entre dos cuentas y un saldo inicial negativo de tarjeta.
- Repetir lo anterior sin conexión y cerrar/abrir la app para confirmar la persistencia local.

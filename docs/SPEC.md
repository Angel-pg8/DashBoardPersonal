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
- **Tareas** (fase 4): lista con prioridad y fecha; marcar una como "actual".
- **Pomodoro** (fase 4): temporizador que muestra la tarea actual; ciclos de trabajo y descanso configurables.
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
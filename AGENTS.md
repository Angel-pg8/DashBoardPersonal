# AGENTS.md — Reglas del proyecto

## Proyecto
Dashboard de vida personal de Ángel. PWA **offline-first** para iPhone y PC (Windows). Sin Mac, sin App Store.
Lee siempre: `PRODUCT.md`, `DESIGN.md`, `docs/SPEC.md` y `docs/TASKS.md` antes de empezar.

## Stack (no cambiar sin pedir permiso)
- React + Vite + TypeScript (estricto)
- Tailwind CSS v4 (`@tailwindcss/vite`, tokens en `@theme`)
- Dexie.js (IndexedDB) como base de datos local
- vite-plugin-pwa (service worker + manifest)
- Supabase (login y sincronización) — **solo en la fase 3**
- Vitest para pruebas de lógica
- Hosting: GitHub Pages (subruta; `base` configurable por variable de entorno)

## Comandos
```
npm install
npm run dev        # desarrollo
npm run build      # compilar (debe pasar siempre)
npm run preview    # probar build + PWA
npm run test       # Vitest
npm run lint
```
Antes de dar una tarea por terminada: `npm run build`, `npm run lint` y `npm run test` sin errores.

## Principios de arquitectura
1. **Offline-first**: la interfaz lee y escribe SOLO en Dexie. La nube nunca bloquea la interfaz.
2. Cada registro sincronizable tiene: `id` (UUID), `createdAt`, `updatedAt`, `deletedAt` (borrado lógico, nunca borrar de verdad) y `synced` (boolean).
3. **Dinero en enteros** (centavos) en `amountCents`. Nunca `float`. Formatear solo al mostrar.
4. Fechas en ISO 8601; mostrar en hora local.
5. La lógica (sumas, presupuestos, formato) vive en funciones puras en `src/lib/` con pruebas. Los componentes no calculan.
6. Estructura: `src/db/` (Dexie), `src/lib/`, `src/features/<modulo>/`, `src/components/ui/`, `src/styles/`.
7. Un módulo nuevo (tareas, hábitos, notas) se agrega como carpeta en `features/` y tabla en Dexie sin tocar los demás.

## Diseño
- Todo estilo sale de `DESIGN.md`. No inventar colores, fuentes ni espaciados.
- Usar el skill `impeccable` (ya instalado) para dirigir y revisar el diseño; Taste con el dial de movimiento **bajo**. Si chocan con `DESIGN.md`, gana `DESIGN.md`.
- Fuentes instaladas localmente (`@fontsource-variable/inter`). Nada de CDN.
- Animaciones: solo `transform` y `opacity`, ver `DESIGN.md` sección 7.

## PWA / iOS
- Safari puede borrar datos locales si la app no se abre en semanas: pensar en respaldo (sync y exportar).
- Background Sync no funciona bien en iOS: sincronizar al abrir, al volver a primer plano y en el evento `online`.
- Declarar `viewport-fit=cover`, `apple-touch-icon`, `theme-color` y manifest con iconos maskable.

## Reglas de trabajo
- **Una fase por sesión.** No adelantes fases futuras.
- Cambios pequeños y commits frecuentes con mensajes claros (`feat:`, `fix:`, `chore:`).
- No agregar dependencias sin explicar por qué. Preferir lo que ya está en el stack.
- No guardar claves ni secretos en el repo. Usar `.env` (ignorado por git) y `.env.example`.
- Si algo es ambiguo, elegir la opción más simple y anotarla en `docs/DECISIONS.md`; no detener todo para preguntar, salvo que afecte datos o seguridad.
- Al terminar, resumir: qué se hizo, qué falta, qué probar a mano en el iPhone.

## Qué NO hacer
- No reescribir archivos que no tienen que ver con la tarea.
- No cambiar los tokens de `DESIGN.md`.
- No usar `localStorage` para datos de la app (solo preferencias muy chicas).
- No usar `any` ni desactivar reglas del linter para que compile.

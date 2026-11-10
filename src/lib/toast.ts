/** Duración del aviso con Deshacer antes de cerrarse solo. */
export const TOAST_DURATION_MS = 6000

/** Tiempo que le queda al aviso: lo restante menos lo que pasó en pantalla. Nunca negativo. */
export function remainingToastMs(remainingMs: number, startedAtMs: number, nowMs: number): number {
  const elapsedMs = Math.max(0, nowMs - startedAtMs)
  return Math.max(0, remainingMs - elapsedMs)
}

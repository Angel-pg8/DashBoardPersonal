/** Tiempo mínimo visible de la pantalla de carga para evitar parpadeos (ms). */
export const SPLASH_MIN_DURATION_MS = 350

/** Duración de la transición de fade para ocultar el splash (ms). */
export const SPLASH_FADE_DURATION_MS = 250

/**
 * Calcula el tiempo de espera restante para cumplir con el tiempo mínimo visible del splash.
 * Nunca devuelve un valor negativo.
 */
export function calculateSplashDelay(
  minDurationMs: number,
  startTimeMs: number,
  nowMs: number,
): number {
  const elapsed = Math.max(0, nowMs - startTimeMs)
  return Math.max(0, minDurationMs - elapsed)
}

let dismissed = false

export function resetSplashDismissedForTesting(): void {
  dismissed = false
}

/**
 * Oculta y remueve el splash screen del DOM tras el tiempo mínimo y la transición de fade.
 * Diseñado para ser llamado desde el punto de entrada de la app (main.tsx).
 */
export function dismissSplash(
  minDurationMs = SPLASH_MIN_DURATION_MS,
  fadeDurationMs = SPLASH_FADE_DURATION_MS,
): void {
  if (dismissed) return
  if (typeof document === 'undefined' || typeof window === 'undefined') return

  const splash = document.getElementById('splash')
  if (!splash) return
  dismissed = true

  const splashStart = (window as unknown as { __splashStart?: number }).__splashStart ?? 0
  const delay = calculateSplashDelay(minDurationMs, splashStart, performance.now())

  window.setTimeout(() => {
    const scheduleNextFrame = typeof window.requestAnimationFrame === 'function'
      ? window.requestAnimationFrame
      : (cb: () => void) => window.setTimeout(cb, 0)

    scheduleNextFrame(() => {
      splash.classList.add('splash--hidden')
      window.setTimeout(() => {
        splash.remove()
      }, fadeDurationMs)
    })
  }, delay)
}

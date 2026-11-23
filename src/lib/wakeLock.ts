export type WakeLockSentinelLike = {
  released: boolean
  release: () => Promise<void>
  addEventListener: (type: 'release', listener: () => void) => void
  removeEventListener: (type: 'release', listener: () => void) => void
}

let activeSentinel: WakeLockSentinelLike | null = null

export function isWakeLockSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'wakeLock' in navigator &&
    typeof navigator.wakeLock?.request === 'function'
  )
}

export function isWakeLockActive(): boolean {
  return Boolean(activeSentinel && !activeSentinel.released)
}

export async function requestWakeLock(): Promise<boolean> {
  if (!isWakeLockSupported()) {
    return false
  }

  if (isWakeLockActive()) {
    return true
  }

  try {
    const sentinel = (await navigator.wakeLock.request('screen')) as unknown as WakeLockSentinelLike
    activeSentinel = sentinel
    sentinel.addEventListener('release', () => {
      if (activeSentinel === sentinel) {
        activeSentinel = null
      }
    })
    return true
  } catch {
    activeSentinel = null
    return false
  }
}

export async function releaseWakeLock(): Promise<boolean> {
  if (!activeSentinel) {
    return false
  }

  try {
    const sentinel = activeSentinel
    activeSentinel = null
    await sentinel.release()
    return true
  } catch {
    return false
  }
}

/** Utilidad interna para pruebas: restablece el estado del sentinel activo */
export function _resetWakeLockState(): void {
  activeSentinel = null
}

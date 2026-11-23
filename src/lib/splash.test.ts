import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  calculateSplashDelay,
  dismissSplash,
  resetSplashDismissedForTesting,
  SPLASH_FADE_DURATION_MS,
  SPLASH_MIN_DURATION_MS,
} from './splash'

describe('splash timing constants', () => {
  it('tiene un tiempo mínimo visible de 350 ms para evitar parpadeos', () => {
    expect(SPLASH_MIN_DURATION_MS).toBe(350)
  })

  it('tiene una duración de fade de 250 ms', () => {
    expect(SPLASH_FADE_DURATION_MS).toBe(250)
  })
})

describe('calculateSplashDelay', () => {
  it('espera el tiempo restante cuando transcurrió menos del tiempo mínimo', () => {
    // Si pasaron 100 ms desde el inicio, debe esperar 250 ms más (350 - 100)
    expect(calculateSplashDelay(350, 0, 100)).toBe(250)
  })

  it('no espera nada si ya transcurrió más tiempo que el mínimo requerido', () => {
    // Si la carga tardó 500 ms, el delay es 0
    expect(calculateSplashDelay(350, 0, 500)).toBe(0)
    expect(calculateSplashDelay(350, 1000, 1400)).toBe(0)
  })

  it('devuelve el tiempo mínimo completo si se llama inmediatamente al inicio', () => {
    expect(calculateSplashDelay(350, 100, 100)).toBe(350)
  })

  it('nunca devuelve un número negativo ante discrepancias de reloj', () => {
    expect(calculateSplashDelay(350, 500, 100)).toBe(350)
  })
})

describe('dismissSplash DOM execution', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetSplashDismissedForTesting()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    // Limpieza de globales simulados si los hubiere
    delete (globalThis as Record<string, unknown>).window
    delete (globalThis as Record<string, unknown>).document
  })

  it('no falla en entornos sin document o sin elemento splash', () => {
    expect(() => dismissSplash()).not.toThrow()
  })

  it('aplica la clase de fade y elimina el elemento tras la transición', () => {
    const classList = {
      classes: new Set<string>(),
      add: vi.fn((cls: string) => classList.classes.add(cls)),
      contains: vi.fn((cls: string) => classList.classes.has(cls)),
    }
    const mockElement = {
      id: 'splash',
      classList,
      remove: vi.fn(),
    }

    const mockDoc = {
      getElementById: vi.fn((id: string) => (id === 'splash' ? mockElement : null)),
    }

    const mockWin = {
      __splashStart: 100,
      setTimeout: globalThis.setTimeout.bind(globalThis),
      requestAnimationFrame: (cb: () => void) => {
        cb()
        return 1
      },
    }

    vi.stubGlobal('document', mockDoc)
    vi.stubGlobal('window', mockWin)
    vi.spyOn(performance, 'now').mockReturnValue(200) // pasaron 100ms (200 - 100)

    dismissSplash(350, 250)

    // Antes de cumplir 250ms restantes, la clase aún no se añade
    vi.advanceTimersByTime(240)
    expect(classList.add).not.toHaveBeenCalled()

    // A los 250ms (350 - 100), se activa la clase de fade
    vi.advanceTimersByTime(10)
    expect(classList.add).toHaveBeenCalledWith('splash--hidden')
    expect(mockElement.remove).not.toHaveBeenCalled()

    // Tras el fade de 250ms, se llama a remove()
    vi.advanceTimersByTime(250)
    expect(mockElement.remove).toHaveBeenCalledTimes(1)
  })

  it('ignora llamadas duplicadas para no re-ejecutar timers', () => {
    const classList = {
      add: vi.fn(),
    }
    const mockElement = {
      id: 'splash',
      classList,
      remove: vi.fn(),
    }

    const mockDoc = {
      getElementById: vi.fn((id: string) => (id === 'splash' ? mockElement : null)),
    }

    const mockWin = {
      __splashStart: 0,
      setTimeout: globalThis.setTimeout.bind(globalThis),
      requestAnimationFrame: (cb: () => void) => {
        cb()
        return 1
      },
    }

    vi.stubGlobal('document', mockDoc)
    vi.stubGlobal('window', mockWin)
    vi.spyOn(performance, 'now').mockReturnValue(500)

    dismissSplash(350, 250)
    dismissSplash(350, 250)

    vi.advanceTimersByTime(0)
    expect(classList.add).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(250)
    expect(mockElement.remove).toHaveBeenCalledTimes(1)
  })
})

let audioContextInstance: AudioContext | null = null

function getAudioContextClass(): (new () => AudioContext) | null {
  if (typeof window !== 'undefined') {
    const win = window as unknown as {
      AudioContext?: new () => AudioContext
      webkitAudioContext?: new () => AudioContext
    }
    if (win.AudioContext) return win.AudioContext
    if (win.webkitAudioContext) return win.webkitAudioContext
  }
  if (typeof globalThis !== 'undefined') {
    const glob = globalThis as unknown as {
      AudioContext?: new () => AudioContext
      webkitAudioContext?: new () => AudioContext
    }
    if (glob.AudioContext) return glob.AudioContext
    if (glob.webkitAudioContext) return glob.webkitAudioContext
  }
  return null
}

function getAudioContext(): AudioContext | null {
  const AudioContextClass = getAudioContextClass()
  if (!AudioContextClass) return null

  if (!audioContextInstance || audioContextInstance.state === 'closed') {
    try {
      audioContextInstance = new AudioContextClass()
    } catch {
      return null
    }
  }
  return audioContextInstance
}

export async function playCompletionSound(): Promise<boolean> {
  const ctx = getAudioContext()
  if (!ctx) return false

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    // Tono sintético de dos notas suaves: D5 (587.33 Hz) -> A5 (880 Hz)
    osc.frequency.setValueAtTime(587.33, now)
    osc.frequency.setValueAtTime(880, now + 0.12)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.03)
    gain.gain.setValueAtTime(0.2, now + 0.12)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.36)

    return true
  } catch {
    return false
  }
}

/** Utilidad interna para pruebas: reinicia la instancia del AudioContext */
export function _resetAudioContext(): void {
  if (audioContextInstance && audioContextInstance.state !== 'closed') {
    try {
      void audioContextInstance.close()
    } catch {
      // Ignorar errores en cierre de prueba
    }
  }
  audioContextInstance = null
}

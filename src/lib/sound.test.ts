import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { _resetAudioContext, playCompletionSound } from './sound'

describe('sound helper (Web Audio API)', () => {
  beforeEach(() => {
    _resetAudioContext()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    _resetAudioContext()
  })

  it('returns false gracefully when AudioContext is unavailable', async () => {
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('window', {})

    const played = await playCompletionSound()
    expect(played).toBe(false)
  })

  it('creates oscillator and plays synthetic tone when AudioContext is supported', async () => {
    const mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }

    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }

    class MockAudioContext {
      state = 'suspended'
      currentTime = 0
      destination = {}
      resume = vi.fn().mockImplementation(async () => {
        this.state = 'running'
      })
      createOscillator = vi.fn().mockReturnValue(mockOscillator)
      createGain = vi.fn().mockReturnValue(mockGain)
      close = vi.fn().mockResolvedValue(undefined)
    }

    vi.stubGlobal('AudioContext', MockAudioContext)
    vi.stubGlobal('window', { AudioContext: MockAudioContext })

    const played = await playCompletionSound()
    expect(played).toBe(true)
    expect(mockOscillator.start).toHaveBeenCalled()
    expect(mockOscillator.stop).toHaveBeenCalled()
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(587.33, 0)
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(880, 0.12)
  })
})

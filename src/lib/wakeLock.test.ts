import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  _resetWakeLockState,
  isWakeLockActive,
  isWakeLockSupported,
  releaseWakeLock,
  requestWakeLock,
  type WakeLockSentinelLike,
} from './wakeLock'

describe('wakeLock helper', () => {
  beforeEach(() => {
    _resetWakeLockState()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    _resetWakeLockState()
  })

  it('detects lack of wakeLock support when API is absent', () => {
    vi.stubGlobal('navigator', {})
    expect(isWakeLockSupported()).toBe(false)
    expect(isWakeLockActive()).toBe(false)
  })

  it('requests and activates wake lock successfully when supported', async () => {
    let released = false
    const listeners: (() => void)[] = []

    const mockSentinel: WakeLockSentinelLike = {
      get released() {
        return released
      },
      release: vi.fn().mockImplementation(async () => {
        released = true
        listeners.forEach((l) => l())
      }),
      addEventListener: vi.fn((_type, l) => listeners.push(l)),
      removeEventListener: vi.fn(),
    }

    const mockRequest = vi.fn().mockResolvedValue(mockSentinel)

    vi.stubGlobal('navigator', {
      wakeLock: { request: mockRequest },
    })

    expect(isWakeLockSupported()).toBe(true)
    const success = await requestWakeLock()
    expect(success).toBe(true)
    expect(isWakeLockActive()).toBe(true)
    expect(mockRequest).toHaveBeenCalledWith('screen')

    // Subsequent request while active returns true without duplicate request
    const second = await requestWakeLock()
    expect(second).toBe(true)
    expect(mockRequest).toHaveBeenCalledTimes(1)

    // Release
    const releasedOk = await releaseWakeLock()
    expect(releasedOk).toBe(true)
    expect(mockSentinel.release).toHaveBeenCalled()
    expect(isWakeLockActive()).toBe(false)
  })

  it('handles request rejections gracefully without throwing', async () => {
    const mockRequest = vi.fn().mockRejectedValue(new Error('Permission denied'))

    vi.stubGlobal('navigator', {
      wakeLock: { request: mockRequest },
    })

    const result = await requestWakeLock()
    expect(result).toBe(false)
    expect(isWakeLockActive()).toBe(false)
  })
})

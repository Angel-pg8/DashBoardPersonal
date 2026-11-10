import { describe, expect, it } from 'vitest'
import { remainingToastMs, TOAST_DURATION_MS } from './toast'

describe('toast timing', () => {
  it('dismisses on its own after six seconds', () => {
    expect(TOAST_DURATION_MS).toBe(6000)
  })

  it('subtracts the time the toast was visible', () => {
    expect(remainingToastMs(6000, 1000, 2500)).toBe(4500)
  })

  it('keeps the remaining time while paused (no elapsed time)', () => {
    expect(remainingToastMs(4500, 1000, 1000)).toBe(4500)
  })

  it('never returns a negative remaining time', () => {
    expect(remainingToastMs(1000, 0, 9000)).toBe(0)
  })
})

import { describe, expect, it } from 'vitest'
import { getToneForHour, resolveTone } from './tone'

describe('getToneForHour', () => {
  it.each([
    [5, 'morning'], [11, 'morning'], [12, 'day'], [17, 'day'],
    [18, 'dusk'], [20, 'dusk'], [21, 'night'], [4, 'night'],
  ] as const)('returns %s as %s', (hour, expected) => {
    expect(getToneForHour(hour)).toBe(expected)
  })
})

describe('resolveTone', () => {
  it('honours a fixed preference', () => {
    expect(resolveTone('dusk', new Date(2026, 0, 1, 8))).toBe('dusk')
  })
})

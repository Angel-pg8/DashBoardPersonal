import { describe, expect, it } from 'vitest'
import { daysRemainingInFinancePeriod, financePeriod, financePeriodKey, previousFinancePeriodKey } from './period'

describe('finance periods', () => {
  it('uses the calendar month when the start day is one', () => {
    expect(financePeriodKey('2026-11-01')).toBe('2026-11')
    expect(financePeriod('2026-11')).toEqual({ key: '2026-11', start: '2026-11-01', endExclusive: '2026-12-01' })
  })

  it('moves dates before the configured start day into the previous period across years', () => {
    expect(financePeriodKey('2027-01-04', 5)).toBe('2026-12')
    expect(financePeriod('2026-12', 5)).toEqual({ key: '2026-12', start: '2026-12-05', endExclusive: '2027-01-05' })
    expect(previousFinancePeriodKey('2027-01')).toBe('2026-12')
  })

  it('clamps day 31 to short months and counts the remaining days inclusively', () => {
    expect(financePeriodKey('2024-02-28', 31)).toBe('2024-01')
    expect(financePeriodKey('2024-02-29', 31)).toBe('2024-02')
    expect(financePeriod('2024-02', 31)).toEqual({ key: '2024-02', start: '2024-02-29', endExclusive: '2024-03-31' })
    expect(financePeriod('2026-04', 31)).toEqual({ key: '2026-04', start: '2026-04-30', endExclusive: '2026-05-31' })
    expect(daysRemainingInFinancePeriod('2026-04-30', 31)).toBe(31)
    expect(daysRemainingInFinancePeriod('2026-02-28', 31)).toBe(31)
  })
})

import { describe, expect, it } from 'vitest'
import { formatUsdCents, parseAmountCents, parseSignedAmountCents } from './money'

describe('money', () => {
  it('formats USD cents for El Salvador', () => {
    expect(formatUsdCents(123456)).toBe('$1,234.56')
    expect(formatUsdCents(-50)).toBe('-$0.50')
  })

  it('parses typed amounts without floating point rounding', () => {
    expect(parseAmountCents('1,234.56')).toBe(123456)
    expect(parseAmountCents('$ 12.5')).toBe(1250)
    expect(parseAmountCents('7')).toBe(700)
  })

  it('rejects invalid or unsafe amounts', () => {
    expect(parseAmountCents('12.3456')).toBeNull()
    expect(parseAmountCents('twelve')).toBeNull()
    expect(parseAmountCents('9007199254740992')).toBeNull()
  })

  it('parses negative opening balances without permitting negative movements', () => {
    expect(parseSignedAmountCents('-12.50')).toBe(-1250)
    expect(parseSignedAmountCents('-')).toBeNull()
    expect(parseAmountCents('-12.50')).toBeNull()
  })
})

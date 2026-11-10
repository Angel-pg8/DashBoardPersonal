const usdFormatter = new Intl.NumberFormat('es-SV', {
  style: 'currency',
  currency: 'USD',
})

export function formatUsdCents(amountCents: number): string {
  if (!Number.isSafeInteger(amountCents)) throw new TypeError('El importe debe ser un entero seguro en centavos.')
  return usdFormatter.format(amountCents / 100)
}

/** Converts a user-entered USD amount to cents without using floating point arithmetic. */
export function parseAmountCents(value: string): number | null {
  const compact = value.trim().replaceAll(/[$\s]/g, '')
  if (!compact || !/^[\d.,]+$/.test(compact)) return null

  const lastDot = compact.lastIndexOf('.')
  const lastComma = compact.lastIndexOf(',')
  const decimalIndex = Math.max(lastDot, lastComma)
  const hasBothSeparators = lastDot !== -1 && lastComma !== -1
  const fraction = decimalIndex === -1 ? '' : compact.slice(decimalIndex + 1)
  if (!hasBothSeparators && fraction.length > 3) return null
  const treatAsDecimal = decimalIndex !== -1 && fraction.length > 0 && fraction.length <= 2 && (hasBothSeparators || fraction.length !== 3)

  const integerPart = treatAsDecimal ? compact.slice(0, decimalIndex) : compact
  const integerDigits = integerPart.replaceAll(/[.,]/g, '')
  if (!/^\d+$/.test(integerDigits) || (treatAsDecimal && !/^\d+$/.test(fraction))) return null

  const whole = Number(integerDigits)
  const cents = Number((treatAsDecimal ? fraction : '').padEnd(2, '0'))
  if (!Number.isSafeInteger(whole) || !Number.isSafeInteger(cents) || whole > Math.floor((Number.MAX_SAFE_INTEGER - cents) / 100)) return null
  return whole * 100 + cents
}

/** Parses an account opening balance, which may legitimately be negative. */
export function parseSignedAmountCents(value: string): number | null {
  const compact = value.trim()
  const negative = compact.startsWith('-')
  const cents = parseAmountCents(negative ? compact.slice(1) : compact)
  return cents === null ? null : negative ? -cents : cents
}

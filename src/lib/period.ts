export type FinancePeriod = {
  key: string
  start: string
  endExclusive: string
}

function assertStartDay(startDay: number): void {
  if (!Number.isInteger(startDay) || startDay < 1 || startDay > 31) throw new RangeError('El día de inicio debe estar entre 1 y 31.')
}

function parseDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new TypeError('La fecha debe usar el formato YYYY-MM-DD.')
  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) throw new RangeError('La fecha no es válida.')
  return date
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function periodStartDate(year: number, monthIndex: number, startDay: number): Date {
  return new Date(year, monthIndex, Math.min(startDay, daysInMonth(year, monthIndex)))
}

function keyParts(key: string): { year: number; monthIndex: number } {
  const match = /^(\d{4})-(\d{2})$/.exec(key)
  if (!match) throw new TypeError('El período debe usar el formato YYYY-MM.')
  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  if (monthIndex < 0 || monthIndex > 11) throw new RangeError('El mes del período no es válido.')
  return { year, monthIndex }
}

export function financePeriodKey(date: string, startDay = 1): string {
  assertStartDay(startDay)
  const parsed = parseDate(date)
  const startsThisMonth = periodStartDate(parsed.getFullYear(), parsed.getMonth(), startDay)
  const month = parsed.getDate() < startsThisMonth.getDate() ? parsed.getMonth() - 1 : parsed.getMonth()
  const keyDate = new Date(parsed.getFullYear(), month, 1)
  return `${keyDate.getFullYear()}-${String(keyDate.getMonth() + 1).padStart(2, '0')}`
}

export function financePeriod(key: string, startDay = 1): FinancePeriod {
  assertStartDay(startDay)
  const { year, monthIndex } = keyParts(key)
  const start = periodStartDate(year, monthIndex, startDay)
  const end = periodStartDate(year, monthIndex + 1, startDay)
  return { key, start: formatDate(start), endExclusive: formatDate(end) }
}

export function previousFinancePeriodKey(key: string): string {
  const { year, monthIndex } = keyParts(key)
  const previous = new Date(year, monthIndex - 1, 1)
  return `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}`
}

export function daysRemainingInFinancePeriod(date: string, startDay = 1): number {
  const period = financePeriod(financePeriodKey(date, startDay), startDay)
  const current = parseDate(date)
  const end = parseDate(period.endExclusive)
  return Math.max(1, Math.round((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(current.getFullYear(), current.getMonth(), current.getDate())) / 86_400_000))
}

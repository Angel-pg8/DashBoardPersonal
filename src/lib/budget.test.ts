import { describe, expect, it } from 'vitest'
import type { Account, Transaction } from '../db/types'
import { accountBalanceCents, availableCents, availablePerDayCents, daysRemainingInMonth, expenseByCategoryCents, totalByTypeCents, transactionsForMonth } from './budget'

const account: Account = { id: 'cash', name: 'Efectivo', kind: 'cash', openingBalanceCents: 0, archived: false, createdAt: '', updatedAt: '', synced: false }
const transactions: Transaction[] = [
  { id: 'income', type: 'income', amountCents: 10000, categoryId: 'salary', accountId: 'cash', date: '2026-11-01', createdAt: '', updatedAt: '', synced: false },
  { id: 'expense', type: 'expense', amountCents: 2500, categoryId: 'food', accountId: 'cash', date: '2026-11-02', createdAt: '', updatedAt: '', synced: false },
  { id: 'transfer', type: 'transfer', amountCents: 1000, accountId: 'cash', transferAccountId: 'bank', date: '2026-11-03', createdAt: '', updatedAt: '', synced: false },
  { id: 'deleted', type: 'expense', amountCents: 999, categoryId: 'food', accountId: 'cash', date: '2026-11-03', createdAt: '', updatedAt: '', deletedAt: '2026-11-03T10:00:00.000Z', synced: false },
  { id: 'previous-month', type: 'expense', amountCents: 500, categoryId: 'food', accountId: 'cash', date: '2026-10-31', createdAt: '', updatedAt: '', synced: false },
]

describe('budget calculations', () => {
  it('does not count transfers or logically deleted movements as income or expense', () => {
    const november = transactionsForMonth(transactions, '2026-11')
    expect(totalByTypeCents(november, 'income')).toBe(10000)
    expect(totalByTypeCents(november, 'expense')).toBe(2500)
    expect(expenseByCategoryCents(november, 'food')).toBe(2500)
    expect(availableCents(8000, november)).toBe(5500)
  })

  it('calculates account balance from movements and permits negative card balances', () => {
    expect(accountBalanceCents(account, transactions)).toBe(6000)
    expect(accountBalanceCents({ ...account, id: 'bank', kind: 'bank' }, transactions)).toBe(1000)
    expect(accountBalanceCents({ ...account, id: 'card', kind: 'card' }, [{ ...transactions[1], accountId: 'card', amountCents: 3500 }])).toBe(-3500)
  })

  it('uses at least one day at the end of a month', () => {
    expect(daysRemainingInMonth(new Date(2026, 1, 28))).toBe(1)
    expect(daysRemainingInMonth(new Date(2026, 2, 1))).toBe(31)
    expect(availablePerDayCents(-100, 0)).toBe(-100)
  })
})

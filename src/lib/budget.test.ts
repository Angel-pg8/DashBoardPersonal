import { describe, expect, it } from 'vitest'
import type { Account, Budget, Category, Transaction } from '../db/types'
import { accountBalanceCents, availableCents, availablePerDayCents, availablePerDayForPeriodCents, budgetStatus, categoryBudgetLimitCents, categoriesByUsage, categoryBudgetSummaries, copyPreviousPeriodBudgetValues, daysRemainingInMonth, expenseByCategoryCents, financeOverview, totalActiveAccountBalanceCents, totalBudgetLimitCents, totalByTypeCents, transactionsForMonth, transactionsForPeriod } from './budget'

const account: Account = { id: 'cash', name: 'Efectivo', kind: 'cash', openingBalanceCents: 0, archived: false, createdAt: '', updatedAt: '', synced: false }
const transactions: Transaction[] = [
  { id: 'income', type: 'income', amountCents: 10000, categoryId: 'salary', accountId: 'cash', date: '2026-11-01', createdAt: '', updatedAt: '', synced: false },
  { id: 'expense', type: 'expense', amountCents: 2500, categoryId: 'food', accountId: 'cash', date: '2026-11-02', createdAt: '', updatedAt: '', synced: false },
  { id: 'transfer', type: 'transfer', amountCents: 1000, accountId: 'cash', transferAccountId: 'bank', date: '2026-11-03', createdAt: '', updatedAt: '', synced: false },
  { id: 'deleted', type: 'expense', amountCents: 999, categoryId: 'food', accountId: 'cash', date: '2026-11-03', createdAt: '', updatedAt: '', deletedAt: '2026-11-03T10:00:00.000Z', synced: false },
  { id: 'previous-month', type: 'expense', amountCents: 500, categoryId: 'food', accountId: 'cash', date: '2026-10-31', createdAt: '', updatedAt: '', synced: false },
]

const categories: Category[] = [
  { id: 'food', name: 'Comida', kind: 'expense', sortOrder: 0, createdAt: '', updatedAt: '', synced: false },
  { id: 'transport', name: 'Transporte', kind: 'expense', sortOrder: 1, createdAt: '', updatedAt: '', synced: false },
]

const budgets: Budget[] = [
  { id: 'total', month: '2026-11', limitCents: 8000, createdAt: '', updatedAt: '', synced: false },
  { id: 'food', month: '2026-11', categoryId: 'food', limitCents: 3000, createdAt: '', updatedAt: '', synced: false },
  { id: 'oct-total', month: '2026-10', limitCents: 7000, createdAt: '', updatedAt: '', synced: false },
  { id: 'oct-food', month: '2026-10', categoryId: 'food', limitCents: 2500, createdAt: '', updatedAt: '', synced: false },
  { id: 'deleted-food', month: '2026-11', categoryId: 'food', limitCents: 9999, createdAt: '', updatedAt: '', deletedAt: '2026-11-01T00:00:00.000Z', synced: false },
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

  it('orders category chips by active movement use', () => {
    const usageCategories: Category[] = [
      { id: 'food', name: 'Comida', kind: 'expense', sortOrder: 1, createdAt: '', updatedAt: '', synced: false },
      { id: 'transport', name: 'Transporte', kind: 'expense', sortOrder: 0, createdAt: '', updatedAt: '', synced: false },
    ]
    const mismatchedIncome: Transaction = { ...transactions[0], id: 'wrong-kind', categoryId: 'transport' }
    expect(categoriesByUsage(usageCategories, [...transactions, mismatchedIncome], 'expense').map((category) => category.id)).toEqual(['food', 'transport'])
  })

  it('uses the shared financial period for movements and daily availability', () => {
    expect(transactionsForPeriod(transactions, '2026-10', 5).map((transaction) => transaction.id)).toEqual(['income', 'expense', 'transfer', 'previous-month'])
    expect(transactionsForPeriod(transactions, '2026-11', 5)).toEqual([])
    expect(availablePerDayForPeriodCents(3100, '2026-11-30', 5)).toBe(620)
  })

  it('calculates total and category budgets without counting deleted records or transfers', () => {
    const november = transactionsForMonth(transactions, '2026-11')
    expect(totalBudgetLimitCents(budgets, '2026-11')).toBe(8000)
    expect(categoryBudgetLimitCents(budgets, '2026-11', 'food')).toBe(3000)
    expect(categoryBudgetLimitCents(budgets, '2026-11', 'transport')).toBeNull()
    expect(categoryBudgetSummaries(categories, budgets, november, '2026-11')).toEqual([
      { categoryId: 'food', limitCents: 3000, spentCents: 2500, remainingCents: 500, progress: 2500 / 3000, status: 'warning' },
      { categoryId: 'transport', limitCents: null, spentCents: 0, remainingCents: null, progress: 0, status: 'none' },
    ])
    expect(availableCents(8000, november)).toBe(5500)
  })

  it('reports zero, warning and exceeded category limits', () => {
    expect(budgetStatus(0, 0).status).toBe('normal')
    expect(budgetStatus(0, 1)).toMatchObject({ progress: 1, status: 'exceeded' })
    expect(budgetStatus(1000, 800).status).toBe('warning')
    expect(budgetStatus(1000, 1001)).toMatchObject({ remainingCents: -1, progress: 1, status: 'exceeded' })
  })

  it('copies active budget values from the immediately previous period', () => {
    expect(copyPreviousPeriodBudgetValues(budgets, '2026-11')).toEqual([
      { month: '2026-11', categoryId: undefined, limitCents: 7000 },
      { month: '2026-11', categoryId: 'food', limitCents: 2500 },
    ])
  })

  it('sums only active, unarchived account balances', () => {
    expect(totalActiveAccountBalanceCents([
      account,
      { ...account, id: 'bank', archived: false },
      { ...account, id: 'archived', archived: true },
      { ...account, id: 'deleted-account', deletedAt: '2026-11-01T00:00:00.000Z' },
    ], transactions)).toBe(7000)
  })

  it('builds one overview from the shared period without counting transfers as income or expense', () => {
    const overview = financeOverview({ accounts: [account, { ...account, id: 'bank' }], budgets, categories, transactions, today: '2026-11-03' })
    expect(overview).toMatchObject({ periodKey: '2026-11', availableCents: 5500, availablePerDayCents: 196, totalBalanceCents: 7000, incomeCents: 10000, expenseCents: 2500 })
    expect(overview.alerts.map((alert) => alert.categoryId)).toEqual(['food'])
    expect(overview.recentTransactions.map((transaction) => transaction.id)).toEqual(['transfer', 'expense', 'income', 'previous-month'])
  })
})

import { describe, expect, it } from 'vitest'
import type { Transaction } from '../db/types'
import { filterTransactions, groupTransactionsByDay, monthOptions } from './transactions'

const transactions: Transaction[] = [
  { id: 'income', type: 'income', amountCents: 10000, categoryId: 'salary', accountId: 'bank', note: 'Nómina', date: '2026-11-04', createdAt: '', updatedAt: '2026-11-04T10:00:00.000Z', synced: false },
  { id: 'expense', type: 'expense', amountCents: 2250, categoryId: 'food', accountId: 'cash', note: 'Mercado', date: '2026-11-04', createdAt: '', updatedAt: '2026-11-04T09:00:00.000Z', synced: false },
  { id: 'transfer', type: 'transfer', amountCents: 1500, accountId: 'cash', transferAccountId: 'bank', date: '2026-11-03', createdAt: '', updatedAt: '2026-11-03T09:00:00.000Z', synced: false },
  { id: 'deleted', type: 'expense', amountCents: 999, categoryId: 'food', accountId: 'cash', date: '2026-11-02', createdAt: '', updatedAt: '2026-11-02T09:00:00.000Z', deletedAt: '2026-11-02T10:00:00.000Z', synced: false },
  { id: 'old', type: 'expense', amountCents: 500, categoryId: 'food', accountId: 'cash', date: '2026-10-31', createdAt: '', updatedAt: '2026-10-31T09:00:00.000Z', synced: false },
]

const novemberFilters = { month: '2026-11', query: '', categoryId: '', accountId: '', type: 'all' as const }

describe('transaction list calculations', () => {
  it('filters active movements by text, type, category and either transfer account', () => {
    expect(filterTransactions(transactions, { ...novemberFilters, query: 'mercado' }).map((transaction) => transaction.id)).toEqual(['expense'])
    expect(filterTransactions(transactions, { ...novemberFilters, type: 'income' }).map((transaction) => transaction.id)).toEqual(['income'])
    expect(filterTransactions(transactions, { ...novemberFilters, categoryId: 'food' }).map((transaction) => transaction.id)).toEqual(['expense'])
    expect(filterTransactions(transactions, { ...novemberFilters, accountId: 'bank' }).map((transaction) => transaction.id)).toEqual(['income', 'transfer'])
  })

  it('groups in descending date order and keeps transfers out of the daily net subtotal', () => {
    const groups = groupTransactionsByDay(filterTransactions(transactions, novemberFilters))
    expect(groups.map((group) => [group.date, group.subtotalCents])).toEqual([['2026-11-04', 7750], ['2026-11-03', 0]])
    expect(groups[0].transactions.map((transaction) => transaction.id)).toEqual(['income', 'expense'])
  })

  it('offers the current month even before its first movement', () => {
    expect(monthOptions(transactions, '2026-12')).toEqual(['2026-12', '2026-11', '2026-10'])
  })
})

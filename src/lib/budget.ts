import type { Account, Budget, Transaction } from '../db/types'

function isActive(transaction: Transaction): boolean {
  return transaction.deletedAt === undefined
}

export function transactionsForMonth(transactions: readonly Transaction[], month: string): Transaction[] {
  return transactions.filter((transaction) => isActive(transaction) && transaction.date.startsWith(`${month}-`))
}

export function totalByTypeCents(transactions: readonly Transaction[], type: Transaction['type']): number {
  return transactions.reduce((total, transaction) => total + (isActive(transaction) && transaction.type === type ? transaction.amountCents : 0), 0)
}

export function expenseByCategoryCents(transactions: readonly Transaction[], categoryId: string): number {
  return transactions.reduce((total, transaction) => total + (isActive(transaction) && transaction.type === 'expense' && transaction.categoryId === categoryId ? transaction.amountCents : 0), 0)
}

export function accountBalanceCents(account: Account, transactions: readonly Transaction[]): number {
  return transactions.reduce((balance, transaction) => {
    if (!isActive(transaction)) return balance
    if (transaction.type === 'income' && transaction.accountId === account.id) return balance + transaction.amountCents
    if (transaction.type === 'expense' && transaction.accountId === account.id) return balance - transaction.amountCents
    if (transaction.type === 'transfer') {
      if (transaction.accountId === account.id) return balance - transaction.amountCents
      if (transaction.transferAccountId === account.id) return balance + transaction.amountCents
    }
    return balance
  }, account.openingBalanceCents)
}

export function totalBudgetLimitCents(budgets: readonly Budget[], month: string): number {
  return budgets.reduce((total, budget) => total + (budget.deletedAt === undefined && budget.month === month && budget.categoryId === undefined ? budget.limitCents : 0), 0)
}

export function availableCents(totalBudgetCents: number, transactions: readonly Transaction[]): number {
  return totalBudgetCents - totalByTypeCents(transactions, 'expense')
}

export function daysRemainingInMonth(date: Date): number {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return Math.max(1, lastDay - date.getDate() + 1)
}

export function availablePerDayCents(available: number, daysRemaining: number): number {
  return Math.trunc(available / Math.max(1, daysRemaining))
}

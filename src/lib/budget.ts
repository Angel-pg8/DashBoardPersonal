import type { Account, Budget, Category, Transaction } from '../db/types'
import { daysRemainingInFinancePeriod, financePeriod, financePeriodKey, previousFinancePeriodKey } from './period'

export type BudgetStatus = 'none' | 'normal' | 'warning' | 'exceeded'

export type CategoryBudgetSummary = {
  categoryId: string
  limitCents: number | null
  spentCents: number
  remainingCents: number | null
  progress: number
  status: BudgetStatus
}

export type FinanceOverview = {
  periodKey: string
  availableCents: number
  availablePerDayCents: number
  totalBalanceCents: number
  incomeCents: number
  expenseCents: number
  alerts: CategoryBudgetSummary[]
  recentTransactions: Transaction[]
}

function isActive(transaction: Transaction): boolean {
  return transaction.deletedAt === undefined
}

export function transactionsForMonth(transactions: readonly Transaction[], month: string): Transaction[] {
  return transactionsForPeriod(transactions, month)
}

export function transactionsForPeriod(transactions: readonly Transaction[], periodKey: string, startDay = 1): Transaction[] {
  const period = financePeriod(periodKey, startDay)
  return transactions.filter((transaction) => isActive(transaction) && transaction.date >= period.start && transaction.date < period.endExclusive)
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

export function categoryBudgetLimitCents(budgets: readonly Budget[], periodKey: string, categoryId: string): number | null {
  const matching = budgets.filter((budget) => budget.deletedAt === undefined && budget.month === periodKey && budget.categoryId === categoryId)
  return matching.length === 0 ? null : matching.reduce((total, budget) => total + budget.limitCents, 0)
}

export function budgetStatus(limitCents: number | null, spentCents: number): Omit<CategoryBudgetSummary, 'categoryId'> {
  if (limitCents === null) return { limitCents, spentCents, remainingCents: null, progress: 0, status: 'none' }
  if (limitCents === 0) return { limitCents, spentCents, remainingCents: -spentCents, progress: spentCents > 0 ? 1 : 0, status: spentCents > 0 ? 'exceeded' : 'normal' }
  const progress = Math.min(spentCents / limitCents, 1)
  const status: BudgetStatus = spentCents > limitCents ? 'exceeded' : spentCents >= Math.ceil(limitCents * 0.8) ? 'warning' : 'normal'
  return { limitCents, spentCents, remainingCents: limitCents - spentCents, progress, status }
}

export function categoryBudgetSummaries(categories: readonly Category[], budgets: readonly Budget[], transactions: readonly Transaction[], periodKey: string): CategoryBudgetSummary[] {
  return categories
    .filter((category) => category.deletedAt === undefined && category.kind === 'expense')
    .map((category) => ({ categoryId: category.id, ...budgetStatus(categoryBudgetLimitCents(budgets, periodKey, category.id), expenseByCategoryCents(transactions, category.id)) }))
}

export function copyPreviousPeriodBudgetValues(budgets: readonly Budget[], targetPeriodKey: string): Pick<Budget, 'month' | 'categoryId' | 'limitCents'>[] {
  const previousKey = previousFinancePeriodKey(targetPeriodKey)
  return budgets
    .filter((budget) => budget.deletedAt === undefined && budget.month === previousKey)
    .map((budget) => ({ month: targetPeriodKey, categoryId: budget.categoryId, limitCents: budget.limitCents }))
}

export function availableCents(totalBudgetCents: number, transactions: readonly Transaction[]): number {
  return totalBudgetCents - totalByTypeCents(transactions, 'expense')
}

export function daysRemainingInMonth(date: Date): number {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return Math.max(1, lastDay - date.getDate() + 1)
}

export function availablePerDayForPeriodCents(availableCentsForPeriod: number, date: string, startDay = 1): number {
  return availablePerDayCents(availableCentsForPeriod, daysRemainingInFinancePeriod(date, startDay))
}

export function totalActiveAccountBalanceCents(accounts: readonly Account[], transactions: readonly Transaction[]): number {
  return accounts.reduce((total, account) => total + (account.deletedAt === undefined && !account.archived ? accountBalanceCents(account, transactions) : 0), 0)
}

export function financeOverview({ accounts, budgets, categories, transactions, today, startDay = 1 }: { accounts: readonly Account[]; budgets: readonly Budget[]; categories: readonly Category[]; transactions: readonly Transaction[]; today: string; startDay?: number }): FinanceOverview {
  const periodKey = financePeriodKey(today, startDay)
  const periodTransactions = transactionsForPeriod(transactions, periodKey, startDay)
  const expenseCents = totalByTypeCents(periodTransactions, 'expense')
  const available = availableCents(totalBudgetLimitCents(budgets, periodKey), periodTransactions)
  const alerts = categoryBudgetSummaries(categories, budgets, periodTransactions, periodKey)
    .filter((summary) => summary.status === 'warning' || summary.status === 'exceeded')
    .sort((left, right) => right.progress - left.progress)
  const recentTransactions = transactions
    .filter(isActive)
    .sort((left, right) => right.date.localeCompare(left.date) || right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 5)
  return {
    periodKey,
    availableCents: available,
    availablePerDayCents: availablePerDayForPeriodCents(available, today, startDay),
    totalBalanceCents: totalActiveAccountBalanceCents(accounts, transactions),
    incomeCents: totalByTypeCents(periodTransactions, 'income'),
    expenseCents,
    alerts,
    recentTransactions,
  }
}

export function availablePerDayCents(available: number, daysRemaining: number): number {
  return Math.trunc(available / Math.max(1, daysRemaining))
}

export function categoriesByUsage(categories: readonly Category[], transactions: readonly Transaction[], kind: Category['kind']): Category[] {
  const uses = new Map<string, number>()
  for (const transaction of transactions) {
    if (isActive(transaction) && transaction.type === kind && transaction.categoryId) uses.set(transaction.categoryId, (uses.get(transaction.categoryId) ?? 0) + 1)
  }
  return [...categories]
    .filter((category) => category.deletedAt === undefined && category.kind === kind)
    .sort((left, right) => (uses.get(right.id) ?? 0) - (uses.get(left.id) ?? 0) || left.sortOrder - right.sortOrder)
}

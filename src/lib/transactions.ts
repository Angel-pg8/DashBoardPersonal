import type { Transaction } from '../db/types'

export type TransactionFilters = {
  month: string
  query: string
  categoryId: string
  accountId: string
  type: 'all' | Transaction['type']
}

export type TransactionDayGroup = {
  date: string
  transactions: Transaction[]
  subtotalCents: number
}

export function transactionNetCents(transaction: Transaction): number {
  if (transaction.type === 'income') return transaction.amountCents
  if (transaction.type === 'expense') return -transaction.amountCents
  return 0
}

export function filterTransactions(
  transactions: readonly Transaction[],
  filters: TransactionFilters,
  searchText: (transaction: Transaction) => string = (transaction) => transaction.note ?? '',
): Transaction[] {
  const query = filters.query.trim().toLocaleLowerCase()
  return transactions
    .filter((transaction) => transaction.deletedAt === undefined)
    .filter((transaction) => transaction.date.startsWith(`${filters.month}-`))
    .filter((transaction) => filters.type === 'all' || transaction.type === filters.type)
    .filter((transaction) => !filters.categoryId || transaction.categoryId === filters.categoryId)
    .filter((transaction) => !filters.accountId || transaction.accountId === filters.accountId || transaction.transferAccountId === filters.accountId)
    .filter((transaction) => !query || searchText(transaction).toLocaleLowerCase().includes(query))
    .sort((left, right) => right.date.localeCompare(left.date) || right.updatedAt.localeCompare(left.updatedAt))
}

export function groupTransactionsByDay(transactions: readonly Transaction[]): TransactionDayGroup[] {
  const groups = new Map<string, Transaction[]>()
  for (const transaction of transactions) {
    const current = groups.get(transaction.date) ?? []
    current.push(transaction)
    groups.set(transaction.date, current)
  }

  return [...groups.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, dayTransactions]) => ({
      date,
      transactions: dayTransactions,
      subtotalCents: dayTransactions.reduce((total, transaction) => total + transactionNetCents(transaction), 0),
    }))
}

export function monthOptions(transactions: readonly Transaction[], currentMonth: string): string[] {
  return [...new Set([currentMonth, ...transactions.filter((transaction) => transaction.deletedAt === undefined).map((transaction) => transaction.date.slice(0, 7))])]
    .sort((left, right) => right.localeCompare(left))
}

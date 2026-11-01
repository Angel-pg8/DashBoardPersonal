import Dexie, { type Table } from 'dexie'
import type { Budget, Category, SyncFields, Transaction } from './types'

export class PersonalDashboardDatabase extends Dexie {
  transactions!: Table<Transaction, string>
  categories!: Table<Category, string>
  budgets!: Table<Budget, string>

  constructor(name = 'dashboard-personal') {
    super(name)
    this.version(1).stores({
      transactions: 'id, type, categoryId, date, updatedAt, deletedAt, synced',
      categories: 'id, kind, name, [kind+name], sortOrder, updatedAt, deletedAt, synced',
      budgets: 'id, month, categoryId, updatedAt, deletedAt, synced',
    })
  }
}

export const db = new PersonalDashboardDatabase()

export function withSyncFields<T extends Record<string, unknown>>(
  values: T,
  now = new Date().toISOString(),
): T & SyncFields {
  return {
    ...values,
    id: typeof values.id === 'string' ? values.id : crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    synced: false,
  }
}

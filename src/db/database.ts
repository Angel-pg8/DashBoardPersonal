import Dexie, { type Table } from 'dexie'
import type { Account, Budget, Category, PomodoroSession, SyncFields, Task, Transaction } from './types'

export class PersonalDashboardDatabase extends Dexie {
  accounts!: Table<Account, string>
  transactions!: Table<Transaction, string>
  categories!: Table<Category, string>
  budgets!: Table<Budget, string>
  tasks!: Table<Task, string>
  pomodoroSessions!: Table<PomodoroSession, string>

  constructor(name = 'dashboard-personal') {
    super(name)
    this.version(1).stores({
      transactions: 'id, type, categoryId, date, updatedAt, deletedAt, synced',
      categories: 'id, kind, name, [kind+name], sortOrder, updatedAt, deletedAt, synced',
      budgets: 'id, month, categoryId, updatedAt, deletedAt, synced',
    })

    // v2 only adds indexes and a table. Existing v1 records remain untouched.
    this.version(2).stores({
      accounts: 'id, name, kind, archived, updatedAt, deletedAt, synced',
      transactions: 'id, type, categoryId, accountId, transferAccountId, date, updatedAt, deletedAt, synced',
      categories: 'id, kind, name, [kind+name], sortOrder, updatedAt, deletedAt, synced',
      budgets: 'id, month, categoryId, updatedAt, deletedAt, synced',
    })

    // v3 adds tasks and pomodoroSessions tables and indexes without altering v1 or v2 data
    this.version(3).stores({
      accounts: 'id, name, kind, archived, updatedAt, deletedAt, synced',
      transactions: 'id, type, categoryId, accountId, transferAccountId, date, updatedAt, deletedAt, synced',
      categories: 'id, kind, name, [kind+name], sortOrder, updatedAt, deletedAt, synced',
      budgets: 'id, month, categoryId, updatedAt, deletedAt, synced',
      tasks: 'id, status, isCurrent, priority, dueDate, sortOrder, updatedAt, deletedAt, synced',
      pomodoroSessions: 'id, taskId, type, completed, startedAt, endedAt, updatedAt, deletedAt, synced',
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

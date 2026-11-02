import 'fake-indexeddb/auto'
import Dexie, { type Table } from 'dexie'
import { afterEach, describe, expect, it } from 'vitest'
import { PersonalDashboardDatabase, withSyncFields } from './database'
import { seedDefaultAccounts, seedDefaultCategories } from './seed'
import type { Transaction } from './types'

const databases: PersonalDashboardDatabase[] = []
function createDatabase() {
  const database = new PersonalDashboardDatabase(`test-${crypto.randomUUID()}`)
  databases.push(database)
  return database
}

afterEach(async () => {
  await Promise.all(databases.splice(0).map((database) => database.delete()))
})

describe('local database', () => {
  it('seeds default categories once, including income and expense', async () => {
    const database = createDatabase()
    await seedDefaultCategories(database)
    await seedDefaultCategories(database)

    const categories = await database.categories.toArray()
    expect(categories).toHaveLength(8)
    expect(categories.some((category) => category.kind === 'income')).toBe(true)
    expect(categories.some((category) => category.kind === 'expense')).toBe(true)
    expect(categories.every((category) => category.synced === false)).toBe(true)
  })

  it('seeds the three default accounts once', async () => {
    const database = createDatabase()
    await seedDefaultAccounts(database)
    await seedDefaultAccounts(database)

    const accounts = await database.accounts.orderBy('name').toArray()
    expect(accounts.map((account) => account.name)).toEqual(['Ahorro', 'Banco', 'Efectivo'])
    expect(accounts.every((account) => account.openingBalanceCents === 0 && account.archived === false)).toBe(true)
  })

  it('creates and reads a transaction with sync fields', async () => {
    const database = createDatabase()
    const record = withSyncFields({
      type: 'expense' as const,
      amountCents: 1250,
      categoryId: 'food',
      date: '2026-10-31',
    })
    await database.transactions.add(record)

    const stored = await database.transactions.get(record.id)
    expect(stored).toMatchObject({ ...record, synced: false })
    expect(stored?.id).toMatch(/^[0-9a-f-]{36}$/i)
    expect(stored?.createdAt).toBe(stored?.updatedAt)
  })

  it('migrates v1 data to v2 without removing existing movements', async () => {
    const name = `legacy-${crypto.randomUUID()}`
    class V1Database extends Dexie {
      transactions!: Table<Transaction, string>

      constructor() {
        super(name)
        this.version(1).stores({
          transactions: 'id, type, categoryId, date, updatedAt, deletedAt, synced',
          categories: 'id, kind, name, [kind+name], sortOrder, updatedAt, deletedAt, synced',
          budgets: 'id, month, categoryId, updatedAt, deletedAt, synced',
        })
      }
    }

    const legacy = new V1Database()
    const record = withSyncFields({ type: 'expense' as const, amountCents: 499, categoryId: 'food', date: '2026-11-01' })
    await legacy.transactions.add(record)
    legacy.close()

    const migrated = new PersonalDashboardDatabase(name)
    databases.push(migrated)
    expect(await migrated.transactions.get(record.id)).toMatchObject(record)
    expect(migrated.accounts).toBeDefined()
  })
})

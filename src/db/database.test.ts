import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { PersonalDashboardDatabase, withSyncFields } from './database'
import { seedDefaultCategories } from './seed'

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
})

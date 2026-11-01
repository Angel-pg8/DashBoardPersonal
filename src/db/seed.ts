import type { PersonalDashboardDatabase } from './database'
import type { Category } from './types'

const defaults: { name: string; kind: Category['kind']; sortOrder: number }[] = [
  { name: 'Comida', kind: 'expense', sortOrder: 0 },
  { name: 'Transporte', kind: 'expense', sortOrder: 1 },
  { name: 'Hogar', kind: 'expense', sortOrder: 2 },
  { name: 'Salud', kind: 'expense', sortOrder: 3 },
  { name: 'Ocio', kind: 'expense', sortOrder: 4 },
  { name: 'Otros gastos', kind: 'expense', sortOrder: 5 },
  { name: 'Salario', kind: 'income', sortOrder: 0 },
  { name: 'Otros ingresos', kind: 'income', sortOrder: 1 },
]

export async function seedDefaultCategories(database: PersonalDashboardDatabase): Promise<void> {
  await database.transaction('rw', database.categories, async () => {
    for (const item of defaults) {
      const existing = await database.categories.where('[kind+name]').equals([item.kind, item.name]).first()
      if (existing) continue
      const now = new Date().toISOString()
      await database.categories.add({
        ...item,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        synced: false,
      })
    }
  })
}

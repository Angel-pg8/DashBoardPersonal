export type SyncFields = {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  synced: boolean
}

export type Transaction = SyncFields & {
  type: 'income' | 'expense'
  amountCents: number
  categoryId: string
  note?: string
  date: string
}

export type Category = SyncFields & {
  name: string
  kind: 'income' | 'expense'
  icon?: string
  sortOrder: number
}

export type Budget = SyncFields & {
  month: string
  categoryId?: string
  limitCents: number
}

export type NewRecord<T extends SyncFields> = Omit<T, keyof SyncFields> & Partial<Pick<T, 'id'>>

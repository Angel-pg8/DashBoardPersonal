export type SyncFields = {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  synced: boolean
}

export type Transaction = SyncFields & {
  type: 'income' | 'expense' | 'transfer'
  amountCents: number
  categoryId?: string
  accountId?: string
  transferAccountId?: string
  note?: string
  date: string
}

export type AccountKind = 'cash' | 'bank' | 'savings' | 'card'

export type Account = SyncFields & {
  name: string
  kind: AccountKind
  openingBalanceCents: number
  archived: boolean
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

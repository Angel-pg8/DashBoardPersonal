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

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'completed'

export type Task = SyncFields & {
  title: string
  status: TaskStatus
  isCurrent: boolean
  priority: TaskPriority
  dueDate?: string        // Formato ISO 'YYYY-MM-DD'
  sortOrder: number
  completedAt?: string    // ISO 8601
}

export type PomodoroSessionType = 'focus' | 'shortBreak' | 'longBreak'

export type PomodoroSession = SyncFields & {
  taskId?: string         // Vinculado a Task.id si se corrió con tarea activa
  type: PomodoroSessionType
  durationSeconds: number // Segundos efectivos completados
  targetDurationSeconds: number
  startedAt: string       // ISO 8601
  endedAt: string         // ISO 8601
  completed: boolean
}

export type PomodoroSettings = {
  focusMinutes: number       // Predeterminado: 25
  shortBreakMinutes: number  // Predeterminado: 5
  longBreakMinutes: number   // Predeterminado: 15
  longBreakInterval: number  // Predeterminado: 4
  autoStartBreaks: boolean   // Predeterminado: false (configurable mediante icono de engranaje)
}

export type NewRecord<T extends SyncFields> = Omit<T, keyof SyncFields> & Partial<Pick<T, 'id'>>

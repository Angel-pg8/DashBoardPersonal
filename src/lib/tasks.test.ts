import { describe, expect, it } from 'vitest'
import type { PomodoroSession, Task } from '../db/types'
import {
  clearCurrentTask,
  countCompletedPomodorosForTask,
  countCompletedPomodorosToday,
  filterActiveTasks,
  filterCompletedTasks,
  filterPendingTasks,
  formatTaskDueDate,
  getCurrentTask,
  priorityWeight,
  restoreTask,
  setTaskAsCurrent,
  softDeleteTask,
  sortTasks,
  taskWithPomodoroCount,
  toggleTaskStatus,
} from './tasks'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: 'Test task',
    status: 'pending',
    isCurrent: false,
    priority: 'medium',
    sortOrder: 0,
    createdAt: '2026-11-23T10:00:00.000Z',
    updatedAt: '2026-11-23T10:00:00.000Z',
    synced: false,
    ...overrides,
  }
}

describe('tasks logic', () => {
  it('filters pending, completed, and active tasks ignoring soft-deleted ones', () => {
    const t1 = makeTask({ id: '1', status: 'pending' })
    const t2 = makeTask({ id: '2', status: 'completed' })
    const t3 = makeTask({ id: '3', status: 'pending', deletedAt: '2026-11-23T11:00:00.000Z' })
    const t4 = makeTask({ id: '4', status: 'completed', deletedAt: '2026-11-23T11:00:00.000Z' })

    const all = [t1, t2, t3, t4]

    expect(filterActiveTasks(all).map((t) => t.id)).toEqual(['1', '2'])
    expect(filterPendingTasks(all).map((t) => t.id)).toEqual(['1'])
    expect(filterCompletedTasks(all).map((t) => t.id)).toEqual(['2'])
  })

  it('retrieves the active current pending task', () => {
    const t1 = makeTask({ id: '1', isCurrent: false })
    const t2 = makeTask({ id: '2', isCurrent: true, status: 'pending' })
    const t3 = makeTask({ id: '3', isCurrent: true, status: 'completed' })
    const t4 = makeTask({ id: '4', isCurrent: true, status: 'pending', deletedAt: '2026-11-23T12:00:00.000Z' })

    expect(getCurrentTask([t1, t2])?.id).toBe('2')
    expect(getCurrentTask([t1, t3])).toBeUndefined()
    expect(getCurrentTask([t1, t4])).toBeUndefined()
  })

  it('assigns correct priority weights', () => {
    expect(priorityWeight('high')).toBe(3)
    expect(priorityWeight('medium')).toBe(2)
    expect(priorityWeight('low')).toBe(1)
  })

  it('sorts tasks with current first, then high priority, then earlier dueDate, then sortOrder', () => {
    const currentLow = makeTask({ id: 'cur', isCurrent: true, priority: 'low' })
    const highNoDate = makeTask({ id: 'high-nodate', isCurrent: false, priority: 'high', sortOrder: 5 })
    const highLater = makeTask({ id: 'high-later', isCurrent: false, priority: 'high', dueDate: '2026-11-25' })
    const highEarlier = makeTask({ id: 'high-early', isCurrent: false, priority: 'high', dueDate: '2026-11-24' })
    const med1 = makeTask({ id: 'med-1', isCurrent: false, priority: 'medium', sortOrder: 1 })
    const med2 = makeTask({ id: 'med-2', isCurrent: false, priority: 'medium', sortOrder: 2 })
    const low = makeTask({ id: 'low', isCurrent: false, priority: 'low' })

    const sorted = sortTasks([low, med2, highLater, highNoDate, currentLow, med1, highEarlier])
    expect(sorted.map((t) => t.id)).toEqual([
      'cur',
      'high-early',
      'high-later',
      'high-nodate',
      'med-1',
      'med-2',
      'low',
    ])
  })

  it('sets a task as current and clears any prior current task', () => {
    const t1 = makeTask({ id: '1', isCurrent: true, updatedAt: 'old' })
    const t2 = makeTask({ id: '2', isCurrent: false, updatedAt: 'old' })
    const t3 = makeTask({ id: '3', isCurrent: false, updatedAt: 'old' })

    const updated = setTaskAsCurrent([t1, t2, t3], '2', '2026-11-23T15:00:00.000Z')

    expect(updated.find((t) => t.id === '1')).toMatchObject({
      isCurrent: false,
      updatedAt: '2026-11-23T15:00:00.000Z',
      synced: false,
    })
    expect(updated.find((t) => t.id === '2')).toMatchObject({
      isCurrent: true,
      updatedAt: '2026-11-23T15:00:00.000Z',
      synced: false,
    })
    expect(updated.find((t) => t.id === '3')?.isCurrent).toBe(false)
  })

  it('clears current task from list', () => {
    const t1 = makeTask({ id: '1', isCurrent: true })
    const t2 = makeTask({ id: '2', isCurrent: false })

    const updated = clearCurrentTask([t1, t2], '2026-11-23T15:00:00.000Z')
    expect(updated.every((t) => t.isCurrent === false)).toBe(true)
  })

  it('toggles task status between pending and completed', () => {
    const pending = makeTask({ id: '1', status: 'pending', isCurrent: true })
    const completed = toggleTaskStatus(pending, '2026-11-23T15:30:00.000Z')

    expect(completed.status).toBe('completed')
    expect(completed.completedAt).toBe('2026-11-23T15:30:00.000Z')
    expect(completed.isCurrent).toBe(false)
    expect(completed.synced).toBe(false)

    const reopened = toggleTaskStatus(completed, '2026-11-23T15:35:00.000Z')
    expect(reopened.status).toBe('pending')
    expect(reopened.completedAt).toBeUndefined()
    expect(reopened.synced).toBe(false)
  })

  it('supports soft deleting and restoring a task', () => {
    const task = makeTask({ id: '1', isCurrent: true })
    const deleted = softDeleteTask(task, '2026-11-23T16:00:00.000Z')

    expect(deleted.deletedAt).toBe('2026-11-23T16:00:00.000Z')
    expect(deleted.isCurrent).toBe(false)
    expect(deleted.synced).toBe(false)

    const restored = restoreTask(deleted, '2026-11-23T16:05:00.000Z')
    expect(restored.deletedAt).toBeUndefined()
    expect(restored.synced).toBe(false)
  })

  it('counts completed focus pomodoros for a task and for today', () => {
    const sessions: PomodoroSession[] = [
      {
        id: 's1',
        taskId: 't1',
        type: 'focus',
        durationSeconds: 1500,
        targetDurationSeconds: 1500,
        startedAt: '2026-11-23T09:00:00.000Z',
        endedAt: '2026-11-23T09:25:00.000Z',
        completed: true,
        createdAt: '2026-11-23T09:25:00.000Z',
        updatedAt: '2026-11-23T09:25:00.000Z',
        synced: false,
      },
      {
        id: 's2',
        taskId: 't1',
        type: 'focus',
        durationSeconds: 1500,
        targetDurationSeconds: 1500,
        startedAt: '2026-11-23T10:00:00.000Z',
        endedAt: '2026-11-23T10:25:00.000Z',
        completed: true,
        createdAt: '2026-11-23T10:25:00.000Z',
        updatedAt: '2026-11-23T10:25:00.000Z',
        synced: false,
      },
      {
        id: 's3',
        taskId: 't1',
        type: 'shortBreak', // break should not count
        durationSeconds: 300,
        targetDurationSeconds: 300,
        startedAt: '2026-11-23T10:25:00.000Z',
        endedAt: '2026-11-23T10:30:00.000Z',
        completed: true,
        createdAt: '2026-11-23T10:30:00.000Z',
        updatedAt: '2026-11-23T10:30:00.000Z',
        synced: false,
      },
      {
        id: 's4',
        taskId: 't1',
        type: 'focus',
        durationSeconds: 400,
        targetDurationSeconds: 1500,
        startedAt: '2026-11-23T11:00:00.000Z',
        endedAt: '2026-11-23T11:06:40.000Z',
        completed: false, // incomplete should not count
        createdAt: '2026-11-23T11:06:40.000Z',
        updatedAt: '2026-11-23T11:06:40.000Z',
        synced: false,
      },
      {
        id: 's5',
        taskId: 't2',
        type: 'focus',
        durationSeconds: 1500,
        targetDurationSeconds: 1500,
        startedAt: '2026-11-22T14:00:00.000Z', // yesterday
        endedAt: '2026-11-22T14:25:00.000Z',
        completed: true,
        createdAt: '2026-11-22T14:25:00.000Z',
        updatedAt: '2026-11-22T14:25:00.000Z',
        synced: false,
      },
    ]

    expect(countCompletedPomodorosForTask('t1', sessions)).toBe(2)
    expect(countCompletedPomodorosForTask('t2', sessions)).toBe(1)
    expect(countCompletedPomodorosForTask('t3', sessions)).toBe(0)

    expect(countCompletedPomodorosToday(sessions, '2026-11-23')).toBe(2)
    expect(countCompletedPomodorosToday(sessions, '2026-11-22')).toBe(1)

    const tasks = [makeTask({ id: 't1' }), makeTask({ id: 't2' }), makeTask({ id: 't3' })]
    const enriched = taskWithPomodoroCount(tasks, sessions)
    expect(enriched.find((t) => t.id === 't1')?.pomodoroCount).toBe(2)
    expect(enriched.find((t) => t.id === 't2')?.pomodoroCount).toBe(1)
    expect(enriched.find((t) => t.id === 't3')?.pomodoroCount).toBe(0)
  })

  it('formats task due date relative to reference date', () => {
    const ref = new Date('2026-11-23T12:00:00.000Z')
    expect(formatTaskDueDate(undefined, ref)).toBeUndefined()
    expect(formatTaskDueDate('2026-11-23', ref)).toBe('Hoy')
    expect(formatTaskDueDate('2026-11-24', ref)).toBe('Mañana')
    expect(formatTaskDueDate('2026-11-28', ref)).toBe('28/11')
    expect(formatTaskDueDate('invalid-date', ref)).toBe('invalid-date')
  })
})

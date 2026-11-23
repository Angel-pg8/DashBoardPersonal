import type { PomodoroSession, Task, TaskPriority } from '../db/types'

export function filterActiveTasks(tasks: readonly Task[]): Task[] {
  return tasks.filter((task) => task.deletedAt === undefined)
}

export function filterPendingTasks(tasks: readonly Task[]): Task[] {
  return tasks.filter((task) => task.deletedAt === undefined && task.status === 'pending')
}

export function filterCompletedTasks(tasks: readonly Task[]): Task[] {
  return tasks.filter((task) => task.deletedAt === undefined && task.status === 'completed')
}

export function getCurrentTask(tasks: readonly Task[]): Task | undefined {
  return tasks.find((task) => task.deletedAt === undefined && task.isCurrent && task.status === 'pending')
}

export function priorityWeight(priority: TaskPriority): number {
  switch (priority) {
    case 'high':
      return 3
    case 'medium':
      return 2
    case 'low':
      return 1
  }
}

export function compareTasks(left: Task, right: Task): number {
  // Current active task stays on top
  if (left.isCurrent !== right.isCurrent) {
    return left.isCurrent ? -1 : 1
  }

  // Priority: high (3) > medium (2) > low (1)
  const priorityDiff = priorityWeight(right.priority) - priorityWeight(left.priority)
  if (priorityDiff !== 0) {
    return priorityDiff
  }

  // Due date: earlier due dates come first; tasks with due date come before tasks without
  if (left.dueDate && right.dueDate) {
    const dueDiff = left.dueDate.localeCompare(right.dueDate)
    if (dueDiff !== 0) return dueDiff
  } else if (left.dueDate && !right.dueDate) {
    return -1
  } else if (!left.dueDate && right.dueDate) {
    return 1
  }

  // Sort order (manual position)
  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder
  }

  // Default fallback: newest created first
  return right.createdAt.localeCompare(left.createdAt)
}

export function sortTasks(tasks: readonly Task[]): Task[] {
  return [...tasks].sort(compareTasks)
}

export function setTaskAsCurrent(
  tasks: readonly Task[],
  currentTaskId: string,
  updatedAt = new Date().toISOString(),
): Task[] {
  return tasks.map((task) => {
    const shouldBeCurrent = task.id === currentTaskId
    if (task.isCurrent === shouldBeCurrent) {
      return task
    }
    return {
      ...task,
      isCurrent: shouldBeCurrent,
      updatedAt,
      synced: false,
    }
  })
}

export function clearCurrentTask(
  tasks: readonly Task[],
  updatedAt = new Date().toISOString(),
): Task[] {
  return tasks.map((task) => {
    if (!task.isCurrent) return task
    return {
      ...task,
      isCurrent: false,
      updatedAt,
      synced: false,
    }
  })
}

export function toggleTaskStatus(
  task: Task,
  now = new Date().toISOString(),
): Task {
  const isCompleting = task.status === 'pending'
  return {
    ...task,
    status: isCompleting ? 'completed' : 'pending',
    completedAt: isCompleting ? now : undefined,
    isCurrent: isCompleting ? false : task.isCurrent,
    updatedAt: now,
    synced: false,
  }
}

export function softDeleteTask(
  task: Task,
  now = new Date().toISOString(),
): Task {
  return {
    ...task,
    deletedAt: now,
    isCurrent: false,
    updatedAt: now,
    synced: false,
  }
}

export function restoreTask(
  task: Task,
  now = new Date().toISOString(),
): Task {
  return {
    ...task,
    deletedAt: undefined,
    updatedAt: now,
    synced: false,
  }
}

export function countCompletedPomodorosForTask(
  taskId: string,
  sessions: readonly PomodoroSession[],
): number {
  return sessions.reduce((count, session) => {
    if (
      session.taskId === taskId &&
      session.type === 'focus' &&
      session.completed &&
      session.deletedAt === undefined
    ) {
      return count + 1
    }
    return count
  }, 0)
}

export function countCompletedPomodorosToday(
  sessions: readonly PomodoroSession[],
  todayIsoDate: string,
): number {
  return sessions.reduce((count, session) => {
    if (
      session.type === 'focus' &&
      session.completed &&
      session.deletedAt === undefined &&
      session.startedAt.startsWith(todayIsoDate)
    ) {
      return count + 1
    }
    return count
  }, 0)
}

export function taskWithPomodoroCount(
  tasks: readonly Task[],
  sessions: readonly PomodoroSession[],
): Array<Task & { pomodoroCount: number }> {
  const countsByTaskId = new Map<string, number>()
  for (const session of sessions) {
    if (
      session.taskId &&
      session.type === 'focus' &&
      session.completed &&
      session.deletedAt === undefined
    ) {
      countsByTaskId.set(session.taskId, (countsByTaskId.get(session.taskId) ?? 0) + 1)
    }
  }

  return tasks.map((task) => ({
    ...task,
    pomodoroCount: countsByTaskId.get(task.id) ?? 0,
  }))
}

import { useCallback, useEffect, useState } from 'react'
import { db, withSyncFields } from '../../db/database'
import type { PomodoroSession, Task, TaskPriority } from '../../db/types'
import {
  clearCurrentTask,
  filterActiveTasks,
  getCurrentTask,
  setTaskAsCurrent,
  softDeleteTask,
  sortTasks,
  taskWithPomodoroCount,
  toggleTaskStatus,
} from '../../lib/tasks'
import type { CompletedPomodoroSessionData } from '../../lib/pomodoro'
import { PomodoroTimer } from './PomodoroTimer'
import { TaskList } from './TaskList'
import { TaskSheet } from './TaskSheet'

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)

  // Cargar datos al montar
  const loadData = useCallback(async () => {
    const [nextTasks, nextSessions] = await Promise.all([
      db.tasks.toArray(),
      db.pomodoroSessions.toArray(),
    ])
    setTasks(nextTasks)
    setSessions(nextSessions)
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const activeTasks = sortTasks(filterActiveTasks(tasks))
  const tasksWithCount = taskWithPomodoroCount(activeTasks, sessions)
  const currentTask = getCurrentTask(tasks)

  // ——— CRUD de tareas ———

  const handleSaveTask = async (data: {
    title: string
    priority: TaskPriority
    dueDate?: string
    isCurrent: boolean
  }) => {
    const now = new Date().toISOString()

    if (taskToEdit) {
      // Editar tarea existente
      const updated: Task = {
        ...taskToEdit,
        title: data.title,
        priority: data.priority,
        dueDate: data.dueDate,
        isCurrent: data.isCurrent,
        updatedAt: now,
        synced: false,
      }
      await db.tasks.put(updated)

      // Si se marcó como actual, desmarcar las demás
      if (data.isCurrent) {
        const others = tasks.filter((t) => t.id !== taskToEdit.id && t.isCurrent)
        for (const other of others) {
          await db.tasks.put({ ...other, isCurrent: false, updatedAt: now, synced: false })
        }
      }
    } else {
      // Crear nueva tarea
      const maxSort = tasks.reduce((max, t) => Math.max(max, t.sortOrder), 0)
      const newTask = withSyncFields({
        title: data.title,
        status: 'pending' as const,
        isCurrent: data.isCurrent,
        priority: data.priority,
        dueDate: data.dueDate,
        sortOrder: maxSort + 1,
      })
      await db.tasks.add(newTask)

      // Si se marcó como actual, desmarcar las demás
      if (data.isCurrent) {
        const others = tasks.filter((t) => t.isCurrent)
        for (const other of others) {
          await db.tasks.put({ ...other, isCurrent: false, updatedAt: now, synced: false })
        }
      }
    }

    setTaskToEdit(null)
    await loadData()
  }

  const handleToggleStatus = async (task: Task) => {
    const updated = toggleTaskStatus(task)
    await db.tasks.put(updated)
    await loadData()
  }

  const handleSetCurrent = async (task: Task) => {
    const updatedTasks = setTaskAsCurrent(tasks, task.id)
    for (const t of updatedTasks) {
      if (t.isCurrent !== tasks.find((orig) => orig.id === t.id)?.isCurrent) {
        await db.tasks.put(t)
      }
    }
    await loadData()
  }

  const handleClearCurrent = async () => {
    const updatedTasks = clearCurrentTask(tasks)
    for (const t of updatedTasks) {
      if (!t.isCurrent && tasks.find((orig) => orig.id === t.id)?.isCurrent) {
        await db.tasks.put(t)
      }
    }
    await loadData()
  }

  const handleDeleteTask = async (task: Task) => {
    const deleted = softDeleteTask(task)
    await db.tasks.put(deleted)
    await loadData()
  }

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task)
    setSheetOpen(true)
  }

  const handleAddTask = () => {
    setTaskToEdit(null)
    setSheetOpen(true)
  }

  const handleSessionCompleted = async (_session: CompletedPomodoroSessionData) => {
    // Recargar sesiones para actualizar contadores
    const nextSessions = await db.pomodoroSessions.toArray()
    setSessions(nextSessions)
  }

  return (
    <div className="page tasks-page">
      <h1 className="page__title">To do.</h1>

      <div className="tasks-page__columns">
        <PomodoroTimer
          currentTask={currentTask}
          onClearCurrentTask={currentTask ? handleClearCurrent : undefined}
          onSessionCompleted={handleSessionCompleted}
        />

        <TaskList
          tasks={tasksWithCount}
          filter={filter}
          onFilterChange={setFilter}
          onToggleStatus={handleToggleStatus}
          onSetCurrent={handleSetCurrent}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onAddTask={handleAddTask}
        />
      </div>

      <TaskSheet
        open={sheetOpen}
        taskToEdit={taskToEdit}
        onClose={() => {
          setSheetOpen(false)
          setTaskToEdit(null)
        }}
        onSave={handleSaveTask}
      />
    </div>
  )
}

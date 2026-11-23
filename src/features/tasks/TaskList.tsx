import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { EmptyState } from '../../components/ui/EmptyState'
import type { Task } from '../../db/types'
import { filterCompletedTasks, filterPendingTasks } from '../../lib/tasks'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: (Task & { pomodoroCount?: number })[]
  filter: 'pending' | 'completed'
  onFilterChange: (filter: 'pending' | 'completed') => void
  onToggleStatus: (task: Task) => void
  onSetCurrent: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onAddTask: () => void
  className?: string
}

export function TaskList({
  tasks,
  filter,
  onFilterChange,
  onToggleStatus,
  onSetCurrent,
  onEdit,
  onDelete,
  onAddTask,
  className = '',
}: TaskListProps) {
  const pendingTasks = filterPendingTasks(tasks)
  const completedTasks = filterCompletedTasks(tasks)
  const displayedTasks = filter === 'pending' ? pendingTasks : completedTasks

  return (
    <Card className={`tasks-card ${className}`}>
      {/* Cabecera de la lista */}
      <div className="tasks-card__header">
        <div>
          <h2 className="tasks-card__title">Tareas</h2>
          <p className="tasks-card__subtitle">
            {pendingTasks.length} {pendingTasks.length === 1 ? 'pendiente' : 'pendientes'}
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={onAddTask}
          className="tasks-card__add-btn"
          aria-label="Agregar nueva tarea"
        >
          <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
          <span>Nueva tarea</span>
        </Button>
      </div>

      {/* Filtros por chip */}
      <div className="tasks-card__filters" role="tablist" aria-label="Filtro de tareas">
        <Chip
          selected={filter === 'pending'}
          onClick={() => onFilterChange('pending')}
        >
          Pendientes ({pendingTasks.length})
        </Chip>
        <Chip
          selected={filter === 'completed'}
          onClick={() => onFilterChange('completed')}
        >
          Completadas ({completedTasks.length})
        </Chip>
      </div>

      {/* Lista de tareas */}
      <div className="tasks-card__list">
        {displayedTasks.length > 0 ? (
          displayedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleStatus={onToggleStatus}
              onSetCurrent={onSetCurrent}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <EmptyState
            title={filter === 'pending' ? 'Todo al día' : 'Sin completadas'}
            description={
              filter === 'pending'
                ? 'No tienes tareas pendientes. Agrega la primera para empezar a avanzar.'
                : 'Aún no has completado ninguna tarea.'
            }
          />
        )}
      </div>
    </Card>
  )
}

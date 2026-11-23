import { Check, Flame, Pencil, Trash2 } from 'lucide-react'
import type { Task } from '../../db/types'
import { formatTaskDueDate } from '../../lib/tasks'

interface TaskItemProps {
  task: Task & { pomodoroCount?: number }
  onToggleStatus: (task: Task) => void
  onSetCurrent: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskItem({
  task,
  onToggleStatus,
  onSetCurrent,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const isCompleted = task.status === 'completed'
  const formattedDueDate = formatTaskDueDate(task.dueDate)
  const pomodoroCount = task.pomodoroCount ?? 0

  const priorityLabel =
    task.priority === 'high'
      ? '▲ Alta'
      : task.priority === 'medium'
        ? '▬ Media'
        : '▼ Baja'

  const handleDelete = () => {
    if (window.confirm(`¿Borrar la tarea "${task.title}"?`)) {
      onDelete(task)
    }
  }

  return (
    <div className={`task-item ${isCompleted ? 'task-item--completed' : ''} ${task.isCurrent ? 'task-item--current' : ''}`}>
      {/* Checkbox táctil (≥44×44 px) */}
      <button
        type="button"
        role="checkbox"
        aria-checked={isCompleted}
        className={`task-item__checkbox ${isCompleted ? 'task-item__checkbox--checked' : ''}`}
        onClick={() => onToggleStatus(task)}
        aria-label={isCompleted ? `Marcar "${task.title}" como pendiente` : `Completar "${task.title}"`}
      >
        {isCompleted && <Check size={18} strokeWidth={3} aria-hidden="true" />}
      </button>

      {/* Contenido principal */}
      <div className="task-item__content" onClick={() => onEdit(task)}>
        <p className="task-item__title">{task.title}</p>
        <div className="task-item__meta">
          <span className={`task-item__priority task-item__priority--${task.priority}`}>
            {priorityLabel}
          </span>
          {formattedDueDate && (
            <span className="task-item__badge task-item__badge--date">
              {formattedDueDate}
            </span>
          )}
          {pomodoroCount > 0 && (
            <span className="task-item__badge task-item__badge--pomodoro" title={`${pomodoroCount} pomodoros completados`}>
              {pomodoroCount} {pomodoroCount === 1 ? 'pomodoro' : 'pomodoros'}
            </span>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="task-item__actions">
        {!isCompleted && (
          task.isCurrent ? (
            <span className="task-item__current-badge" title="Tarea activa en Pomodoro">
              Actual
            </span>
          ) : (
            <button
              type="button"
              className="task-item__action-btn"
              onClick={() => onSetCurrent(task)}
              aria-label={`Fijar "${task.title}" como tarea actual`}
              title="Fijar como tarea actual"
            >
              <Flame size={20} aria-hidden="true" />
            </button>
          )
        )}

        <button
          type="button"
          className="task-item__action-btn"
          onClick={() => onEdit(task)}
          aria-label={`Editar tarea "${task.title}"`}
          title="Editar"
        >
          <Pencil size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="task-item__action-btn task-item__action-btn--delete"
          onClick={handleDelete}
          aria-label={`Borrar tarea "${task.title}"`}
          title="Borrar"
        >
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

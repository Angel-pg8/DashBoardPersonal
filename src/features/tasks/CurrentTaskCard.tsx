import { Flame, ListTodo } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import type { PomodoroSession, Task } from '../../db/types'
import { countCompletedPomodorosToday } from '../../lib/tasks'

interface CurrentTaskCardProps {
  currentTask?: Task
  sessions: readonly PomodoroSession[]
  today: string
  onGoToTodo: () => void
}

export function CurrentTaskCard({
  currentTask,
  sessions,
  today,
  onGoToTodo,
}: CurrentTaskCardProps) {
  const pomodorosToday = countCompletedPomodorosToday(sessions, today)

  return (
    <Card className="current-task-card">
      <div className="current-task-card__header">
        <Flame size={20} aria-hidden="true" className="current-task-card__icon" />
        <span className="current-task-card__eyebrow">Foco del día</span>
      </div>

      {currentTask ? (
        <div className="current-task-card__body">
          <p className="current-task-card__task-name">{currentTask.title}</p>
          <p className="current-task-card__pomodoros">
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{pomodorosToday}</span>{' '}
            {pomodorosToday === 1 ? 'pomodoro' : 'pomodoros'} hoy
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={onGoToTodo}
            className="current-task-card__action"
          >
            Iniciar foco
          </Button>
        </div>
      ) : (
        <div className="current-task-card__body">
          <p className="current-task-card__empty">
            Sin tarea activa. Elige una para empezar a enfocar tu tiempo.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={onGoToTodo}
            className="current-task-card__action"
          >
            <ListTodo size={18} strokeWidth={2} aria-hidden="true" />
            <span>Elegir tarea</span>
          </Button>
        </div>
      )}
    </Card>
  )
}

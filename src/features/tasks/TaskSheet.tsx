import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { Input } from '../../components/ui/Input'
import { Sheet } from '../../components/ui/Sheet'
import type { Task, TaskPriority } from '../../db/types'

interface TaskSheetProps {
  open: boolean
  taskToEdit?: Task | null
  onClose: () => void
  onSave: (data: {
    title: string
    priority: TaskPriority
    dueDate?: string
    isCurrent: boolean
  }) => void
}

function getTodayIso(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function getTomorrowIso(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
}

export function TaskSheet({
  open,
  taskToEdit,
  onClose,
  onSave,
}: TaskSheetProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dateOption, setDateOption] = useState<'today' | 'tomorrow' | 'none' | 'custom'>('none')
  const [customDate, setCustomDate] = useState('')
  const [isCurrent, setIsCurrent] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const titleInputRef = useRef<HTMLInputElement | null>(null)

  // Sincronizar estado cuando abre el sheet o cambia taskToEdit
  useEffect(() => {
    if (!open) return

    if (taskToEdit) {
      setTitle(taskToEdit.title)
      setPriority(taskToEdit.priority)
      setIsCurrent(taskToEdit.isCurrent)

      const today = getTodayIso()
      const tomorrow = getTomorrowIso()

      if (!taskToEdit.dueDate) {
        setDateOption('none')
        setCustomDate('')
      } else if (taskToEdit.dueDate === today) {
        setDateOption('today')
        setCustomDate('')
      } else if (taskToEdit.dueDate === tomorrow) {
        setDateOption('tomorrow')
        setCustomDate('')
      } else {
        setDateOption('custom')
        setCustomDate(taskToEdit.dueDate)
      }
    } else {
      setTitle('')
      setPriority('medium')
      setDateOption('none')
      setCustomDate('')
      setIsCurrent(false)
    }
    setError(undefined)

    // Auto-focus en el título
    const timer = window.setTimeout(() => {
      titleInputRef.current?.focus()
    }, 50)
    return () => window.clearTimeout(timer)
  }, [open, taskToEdit])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('El título de la tarea es obligatorio.')
      return
    }

    let dueDate: string | undefined
    if (dateOption === 'today') {
      dueDate = getTodayIso()
    } else if (dateOption === 'tomorrow') {
      dueDate = getTomorrowIso()
    } else if (dateOption === 'custom' && customDate) {
      dueDate = customDate
    }

    onSave({
      title: trimmedTitle,
      priority,
      dueDate,
      isCurrent,
    })
    onClose()
  }

  const sheetTitle = taskToEdit ? 'Editar tarea' : 'Nueva tarea'

  return (
    <Sheet open={open} title={sheetTitle} onClose={onClose}>
      <form onSubmit={handleSubmit} className="quick-entry">
        <div className="quick-entry__group">
          <Input
            ref={titleInputRef}
            id="task-title"
            label="Título de la tarea"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (error) setError(undefined)
            }}
            placeholder="¿Qué vas a hacer?"
            error={error}
            required
          />
        </div>

        {/* Prioridad de 3 niveles */}
        <div className="quick-entry__group">
          <span className="field-label">Prioridad</span>
          <div className="chip-row" role="radiogroup" aria-label="Prioridad de la tarea">
            <Chip
              selected={priority === 'low'}
              onClick={() => setPriority('low')}
            >
              ▼ Baja
            </Chip>
            <Chip
              selected={priority === 'medium'}
              onClick={() => setPriority('medium')}
            >
              ▬ Media
            </Chip>
            <Chip
              selected={priority === 'high'}
              onClick={() => setPriority('high')}
            >
              ▲ Alta
            </Chip>
          </div>
        </div>

        {/* Fecha de vencimiento */}
        <div className="quick-entry__group">
          <span className="field-label">Fecha</span>
          <div className="chip-row">
            <Chip
              selected={dateOption === 'none'}
              onClick={() => setDateOption('none')}
            >
              Sin fecha
            </Chip>
            <Chip
              selected={dateOption === 'today'}
              onClick={() => setDateOption('today')}
            >
              Hoy
            </Chip>
            <Chip
              selected={dateOption === 'tomorrow'}
              onClick={() => setDateOption('tomorrow')}
            >
              Mañana
            </Chip>
            <Chip
              selected={dateOption === 'custom'}
              onClick={() => setDateOption('custom')}
            >
              Otra fecha
            </Chip>
          </div>

          {dateOption === 'custom' && (
            <div style={{ marginTop: '.75rem' }}>
              <Input
                id="task-custom-date"
                label="Fecha personalizada"
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                required
              />
            </div>
          )}
        </div>

        {/* Fijar como tarea actual */}
        <div className="quick-entry__group">
          <label className="pomodoro-settings__toggle">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="pomodoro-settings__checkbox"
            />
            <span className="pomodoro-settings__toggle-label">
              <strong>Fijar como tarea actual</strong>
              <small>La coloca en el temporizador superior al guardar.</small>
            </span>
          </label>
        </div>

        <div className="quick-entry__actions" style={{ marginTop: '1rem' }}>
          <Button type="submit" variant="primary">
            {taskToEdit ? 'Guardar cambios' : 'Crear tarea'}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}

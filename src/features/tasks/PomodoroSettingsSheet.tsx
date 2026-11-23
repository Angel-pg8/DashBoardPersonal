import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Sheet } from '../../components/ui/Sheet'
import type { PomodoroSettings } from '../../db/types'

interface PomodoroSettingsSheetProps {
  open: boolean
  settings: PomodoroSettings
  onClose: () => void
  onSave: (nextSettings: PomodoroSettings) => void
}

export function PomodoroSettingsSheet({
  open,
  settings,
  onClose,
  onSave,
}: PomodoroSettingsSheetProps) {
  const [focusMinutes, setFocusMinutes] = useState(settings.focusMinutes)
  const [shortBreakMinutes, setShortBreakMinutes] = useState(settings.shortBreakMinutes)
  const [longBreakMinutes, setLongBreakMinutes] = useState(settings.longBreakMinutes)
  const [longBreakInterval, setLongBreakInterval] = useState(settings.longBreakInterval)
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks)

  // Resetea valores si abre con nuevos settings
  const handleOpen = () => {
    setFocusMinutes(settings.focusMinutes)
    setShortBreakMinutes(settings.shortBreakMinutes)
    setLongBreakMinutes(settings.longBreakMinutes)
    setLongBreakInterval(settings.longBreakInterval)
    setAutoStartBreaks(settings.autoStartBreaks)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSave({
      focusMinutes: Math.max(1, Math.min(180, Math.round(Number(focusMinutes) || 25))),
      shortBreakMinutes: Math.max(1, Math.min(60, Math.round(Number(shortBreakMinutes) || 5))),
      longBreakMinutes: Math.max(1, Math.min(120, Math.round(Number(longBreakMinutes) || 15))),
      longBreakInterval: Math.max(1, Math.min(12, Math.round(Number(longBreakInterval) || 4))),
      autoStartBreaks,
    })
    onClose()
  }

  return (
    <Sheet
      open={open}
      title="Ajustes de Pomodoro"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="quick-entry" onFocus={handleOpen}>
        <div className="quick-entry__group">
          <Input
            id="focus-minutes"
            label="Minutos de foco"
            type="number"
            min={1}
            max={180}
            step={1}
            value={focusMinutes}
            onChange={(e) => setFocusMinutes(Number(e.target.value))}
            required
          />
        </div>

        <div className="quick-entry__group">
          <Input
            id="short-break-minutes"
            label="Descanso corto (minutos)"
            type="number"
            min={1}
            max={60}
            step={1}
            value={shortBreakMinutes}
            onChange={(e) => setShortBreakMinutes(Number(e.target.value))}
            required
          />
        </div>

        <div className="quick-entry__group">
          <Input
            id="long-break-minutes"
            label="Descanso largo (minutos)"
            type="number"
            min={1}
            max={120}
            step={1}
            value={longBreakMinutes}
            onChange={(e) => setLongBreakMinutes(Number(e.target.value))}
            required
          />
        </div>

        <div className="quick-entry__group">
          <Input
            id="long-break-interval"
            label="Ciclo de descanso largo (cada N pomodoros)"
            type="number"
            min={1}
            max={12}
            step={1}
            value={longBreakInterval}
            onChange={(e) => setLongBreakInterval(Number(e.target.value))}
            required
          />
        </div>

        <div className="quick-entry__group">
          <label className="pomodoro-settings__toggle">
            <input
              type="checkbox"
              checked={autoStartBreaks}
              onChange={(e) => setAutoStartBreaks(e.target.checked)}
              className="pomodoro-settings__checkbox"
            />
            <span className="pomodoro-settings__toggle-label">
              <strong>Iniciar descansos automáticamente</strong>
              <small>Empieza el descanso sin esperar confirmación al terminar el foco.</small>
            </span>
          </label>
        </div>

        <div className="quick-entry__actions" style={{ marginTop: '1rem' }}>
          <Button type="submit" variant="primary">
            Guardar ajustes
          </Button>
        </div>
      </form>
    </Sheet>
  )
}

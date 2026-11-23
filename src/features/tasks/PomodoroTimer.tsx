import { useEffect, useRef, useState } from 'react'
import { Settings } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { db, withSyncFields } from '../../db/database'
import type { PomodoroSettings, Task } from '../../db/types'
import {
  type CompletedPomodoroSessionData,
  createInitialPomodoroState,
  evaluateTimer,
  formatTimerDisplay,
  loadPomodoroSettings,
  pauseTimer,
  type PomodoroState,
  resetTimer,
  resumeTimer,
  savePomodoroSettings,
  setTimerPhase,
  skipToNextPhase,
  startTimer,
  type TimerPhase,
} from '../../lib/pomodoro'
import { playCompletionSound } from '../../lib/sound'
import { releaseWakeLock, requestWakeLock } from '../../lib/wakeLock'
import { PomodoroSettingsSheet } from './PomodoroSettingsSheet'

interface PomodoroTimerProps {
  currentTask?: Task
  onClearCurrentTask?: () => void
  onSessionCompleted?: (session: CompletedPomodoroSessionData) => void
  className?: string
}

export function PomodoroTimer({
  currentTask,
  onClearCurrentTask,
  onSessionCompleted,
  className = '',
}: PomodoroTimerProps) {
  const [settings, setSettings] = useState<PomodoroSettings>(loadPomodoroSettings)
  const [state, setState] = useState<PomodoroState>(() =>
    createInitialPomodoroState(settings, 'focus', currentTask?.id),
  )
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Mantener taskId sincronizado en el estado del timer
  useEffect(() => {
    setState((current) => ({
      ...current,
      currentTaskId: currentTask?.id,
    }))
  }, [currentTask?.id])

  // Referencias para closures dentro de listeners de visibilidad/temporizador
  const stateRef = useRef(state)
  stateRef.current = state
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const onSessionCompletedRef = useRef(onSessionCompleted)
  onSessionCompletedRef.current = onSessionCompleted

  // Manejo de finalización de sesión
  const handleSessionFinished = useRef(
    async (completedSession: CompletedPomodoroSessionData, nextState: PomodoroState) => {
      void playCompletionSound()
      if (nextState.status !== 'running') {
        void releaseWakeLock()
      }

      try {
        await db.pomodoroSessions.add(withSyncFields(completedSession))
      } catch {
        // Continuar incluso si IndexedDB falla momentáneamente
      }

      onSessionCompletedRef.current?.(completedSession)
    },
  )

  // Intervalo de evaluación de tiempo en primer plano (1 segundo)
  useEffect(() => {
    if (state.status !== 'running') {
      return
    }

    const interval = window.setInterval(() => {
      const { state: nextState, didComplete, completedSession } = evaluateTimer(
        stateRef.current,
        settingsRef.current,
        Date.now(),
      )

      setState(nextState)

      if (didComplete && completedSession) {
        void handleSessionFinished.current(completedSession, nextState)
      }
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [state.status])

  // Resiliencia ante suspensión en iOS (visibilitychange y focus)
  useEffect(() => {
    const handleReactivation = () => {
      if (document.visibilityState === 'visible' && stateRef.current.status === 'running') {
        const { state: nextState, didComplete, completedSession } = evaluateTimer(
          stateRef.current,
          settingsRef.current,
          Date.now(),
        )

        setState(nextState)

        if (didComplete && completedSession) {
          void handleSessionFinished.current(completedSession, nextState)
        }
      }
    }

    document.addEventListener('visibilitychange', handleReactivation)
    window.addEventListener('focus', handleReactivation)

    return () => {
      document.removeEventListener('visibilitychange', handleReactivation)
      window.removeEventListener('focus', handleReactivation)
    }
  }, [])

  // Limpieza al desmontar (liberar Wake Lock)
  useEffect(() => {
    return () => {
      void releaseWakeLock()
    }
  }, [])

  // Acciones del usuario
  const handleStart = async () => {
    const nextState = startTimer(state, Date.now())
    setState(nextState)
    if (nextState.phase === 'focus') {
      void requestWakeLock()
    }
  }

  const handlePause = () => {
    setState(pauseTimer(state, Date.now()))
    void releaseWakeLock()
  }

  const handleResume = async () => {
    const nextState = resumeTimer(state, Date.now())
    setState(nextState)
    if (nextState.phase === 'focus') {
      void requestWakeLock()
    }
  }

  const handleReset = () => {
    setState(resetTimer(state, settings))
    void releaseWakeLock()
  }

  const handleSkip = () => {
    setState(skipToNextPhase(state, settings))
    void releaseWakeLock()
  }

  const handlePhaseChange = (phase: TimerPhase) => {
    setState(setTimerPhase(state, phase, settings))
    void releaseWakeLock()
  }

  const handleSaveSettings = (nextSettings: PomodoroSettings) => {
    setSettings(nextSettings)
    savePomodoroSettings(nextSettings)
    // Si está inactivo, recalcula con la nueva duración
    if (state.status === 'idle') {
      setState(resetTimer(state, nextSettings))
    }
  }

  const phaseTitle =
    state.phase === 'focus'
      ? 'Foco'
      : state.phase === 'shortBreak'
        ? 'Descanso corto'
        : 'Descanso largo'

  const statusLabel =
    state.status === 'running'
      ? state.phase === 'focus'
        ? 'En foco'
        : 'En descanso'
      : state.status === 'paused'
        ? 'Pausado'
        : state.status === 'completed'
          ? 'Completado'
          : 'Listo para iniciar'

  const currentCycleInBlock = state.completedCycles % settings.longBreakInterval

  return (
    <Card className={`pomodoro-hero ${className}`}>
      <div className="pomodoro-hero__header">
        <div>
          <span className="pomodoro-hero__eyebrow">Pomodoro</span>
          <h2 className="pomodoro-hero__title">{phaseTitle}</h2>
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label="Ajustes de Pomodoro"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Selector de fase */}
      <div className="pomodoro-hero__modes" role="tablist" aria-label="Modalidad de temporizador">
        <Chip
          selected={state.phase === 'focus'}
          onClick={() => handlePhaseChange('focus')}
        >
          Foco ({settings.focusMinutes}m)
        </Chip>
        <Chip
          selected={state.phase === 'shortBreak'}
          onClick={() => handlePhaseChange('shortBreak')}
        >
          Descanso corto ({settings.shortBreakMinutes}m)
        </Chip>
        <Chip
          selected={state.phase === 'longBreak'}
          onClick={() => handlePhaseChange('longBreak')}
        >
          Descanso largo ({settings.longBreakMinutes}m)
        </Chip>
      </div>

      {/* Reloj y Estado */}
      <div className="pomodoro-hero__display">
        <div className="pomodoro-hero__time" aria-live="polite">
          {formatTimerDisplay(state.remainingSeconds)}
        </div>
        <div className="pomodoro-hero__status-badge">
          <span
            className={`pomodoro-hero__status-indicator pomodoro-hero__status-indicator--${state.status}`}
            aria-hidden="true"
          />
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Tarea asociada */}
      <div className="pomodoro-hero__task">
        {currentTask ? (
          <div className="pomodoro-hero__task-active">
            <span className="pomodoro-hero__task-label">Trabajando en:</span>
            <strong className="pomodoro-hero__task-name">{currentTask.title}</strong>
            {onClearCurrentTask && (
              <button
                type="button"
                className="pomodoro-hero__task-detach"
                onClick={onClearCurrentTask}
                aria-label={`Desvincular tarea ${currentTask.title}`}
              >
                Desvincular
              </button>
            )}
          </div>
        ) : (
          <p className="pomodoro-hero__task-empty">
            Sin tarea activa — elige una de la lista de abajo
          </p>
        )}
      </div>

      {/* Indicador de ciclo (4 pomodoros hacia el descanso largo) */}
      <div
        className="pomodoro-hero__cycles"
        aria-label={`Ciclo ${currentCycleInBlock} de ${settings.longBreakInterval}`}
      >
        <div className="pomodoro-hero__cycle-dots" aria-hidden="true">
          {Array.from({ length: settings.longBreakInterval }).map((_, index) => (
            <span
              key={index}
              className={`pomodoro-hero__cycle-dot ${
                index < currentCycleInBlock ? 'pomodoro-hero__cycle-dot--filled' : ''
              }`}
            />
          ))}
        </div>
        <span className="pomodoro-hero__cycle-text">
          {currentCycleInBlock} de {settings.longBreakInterval} pomodoros antes del descanso largo
        </span>
      </div>

      {/* Controles táctiles */}
      <div className="pomodoro-hero__controls">
        {state.status === 'idle' || state.status === 'completed' ? (
          <Button
            type="button"
            variant="primary"
            className="pomodoro-hero__main-button"
            onClick={handleStart}
          >
            {state.phase === 'focus' ? 'Iniciar foco' : 'Iniciar descanso'}
          </Button>
        ) : state.status === 'running' ? (
          <>
            <Button
              type="button"
              variant="primary"
              className="pomodoro-hero__main-button"
              onClick={handlePause}
            >
              Pausar
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="pomodoro-hero__secondary-button"
              onClick={handleSkip}
            >
              Saltar
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="primary"
              className="pomodoro-hero__main-button"
              onClick={handleResume}
            >
              Reanudar
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="pomodoro-hero__secondary-button"
              onClick={handleReset}
            >
              Reiniciar
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="pomodoro-hero__secondary-button"
              onClick={handleSkip}
            >
              Saltar
            </Button>
          </>
        )}
      </div>

      <PomodoroSettingsSheet
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
    </Card>
  )
}

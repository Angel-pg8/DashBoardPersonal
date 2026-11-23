import type { PomodoroSession, PomodoroSettings } from '../db/types'

export type TimerPhase = 'focus' | 'shortBreak' | 'longBreak'
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'

export type PomodoroState = {
  phase: TimerPhase
  status: TimerStatus
  targetDurationSeconds: number
  remainingSeconds: number
  startedAt?: string
  targetEndAt?: number
  elapsedBeforePauseSeconds: number
  completedCycles: number
  currentTaskId?: string
}

export type CompletedPomodoroSessionData = Omit<PomodoroSession, 'id' | 'createdAt' | 'updatedAt' | 'synced'>

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
}

export function getPhaseDurationSeconds(
  phase: TimerPhase,
  settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS,
): number {
  switch (phase) {
    case 'focus':
      return Math.max(1, Math.round(settings.focusMinutes * 60))
    case 'shortBreak':
      return Math.max(1, Math.round(settings.shortBreakMinutes * 60))
    case 'longBreak':
      return Math.max(1, Math.round(settings.longBreakMinutes * 60))
  }
}

export function resolveNextPhase(
  currentPhase: TimerPhase,
  completedCycles: number,
  longBreakInterval = 4,
): TimerPhase {
  if (currentPhase === 'focus') {
    const interval = Math.max(1, longBreakInterval)
    return completedCycles > 0 && completedCycles % interval === 0 ? 'longBreak' : 'shortBreak'
  }
  return 'focus'
}

export function createInitialPomodoroState(
  settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS,
  phase: TimerPhase = 'focus',
  currentTaskId?: string,
): PomodoroState {
  const targetDurationSeconds = getPhaseDurationSeconds(phase, settings)
  return {
    phase,
    status: 'idle',
    targetDurationSeconds,
    remainingSeconds: targetDurationSeconds,
    elapsedBeforePauseSeconds: 0,
    completedCycles: 0,
    currentTaskId,
  }
}

export function setTimerPhase(
  state: PomodoroState,
  phase: TimerPhase,
  settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS,
): PomodoroState {
  const targetDurationSeconds = getPhaseDurationSeconds(phase, settings)
  return {
    ...state,
    phase,
    status: 'idle',
    targetDurationSeconds,
    remainingSeconds: targetDurationSeconds,
    startedAt: undefined,
    targetEndAt: undefined,
    elapsedBeforePauseSeconds: 0,
  }
}

export function startTimer(
  state: PomodoroState,
  now = Date.now(),
  isoNow = new Date(now).toISOString(),
): PomodoroState {
  const targetEndAt = now + state.remainingSeconds * 1000
  return {
    ...state,
    status: 'running',
    startedAt: state.startedAt ?? isoNow,
    targetEndAt,
  }
}

export function pauseTimer(
  state: PomodoroState,
  now = Date.now(),
): PomodoroState {
  if (state.status !== 'running' || state.targetEndAt === undefined) {
    return state
  }

  const remainingSeconds = Math.max(0, Math.ceil((state.targetEndAt - now) / 1000))
  const elapsedBeforePauseSeconds = Math.max(0, state.targetDurationSeconds - remainingSeconds)

  return {
    ...state,
    status: 'paused',
    remainingSeconds,
    elapsedBeforePauseSeconds,
    targetEndAt: undefined,
  }
}

export function resumeTimer(
  state: PomodoroState,
  now = Date.now(),
): PomodoroState {
  if (state.status !== 'paused') {
    return state
  }

  const targetEndAt = now + state.remainingSeconds * 1000
  return {
    ...state,
    status: 'running',
    targetEndAt,
  }
}

export function resetTimer(
  state: PomodoroState,
  settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS,
): PomodoroState {
  const targetDurationSeconds = getPhaseDurationSeconds(state.phase, settings)
  return {
    ...state,
    status: 'idle',
    targetDurationSeconds,
    remainingSeconds: targetDurationSeconds,
    startedAt: undefined,
    targetEndAt: undefined,
    elapsedBeforePauseSeconds: 0,
  }
}

export function skipToNextPhase(
  state: PomodoroState,
  settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS,
): PomodoroState {
  const nextPhase = resolveNextPhase(state.phase, state.completedCycles, settings.longBreakInterval)
  const targetDurationSeconds = getPhaseDurationSeconds(nextPhase, settings)
  return {
    ...state,
    phase: nextPhase,
    status: 'idle',
    targetDurationSeconds,
    remainingSeconds: targetDurationSeconds,
    startedAt: undefined,
    targetEndAt: undefined,
    elapsedBeforePauseSeconds: 0,
  }
}

export function evaluateTimer(
  state: PomodoroState,
  settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS,
  now = Date.now(),
  isoNow = new Date(now).toISOString(),
): {
  state: PomodoroState
  didComplete: boolean
  completedSession?: CompletedPomodoroSessionData
} {
  if (state.status !== 'running' || state.targetEndAt === undefined) {
    return { state, didComplete: false }
  }

  if (now < state.targetEndAt) {
    const remainingSeconds = Math.max(0, Math.ceil((state.targetEndAt - now) / 1000))
    return {
      state: {
        ...state,
        remainingSeconds,
      },
      didComplete: false,
    }
  }

  // Session completed (now >= targetEndAt)
  const newCompletedCycles = state.phase === 'focus' ? state.completedCycles + 1 : state.completedCycles
  const nextPhase = resolveNextPhase(state.phase, newCompletedCycles, settings.longBreakInterval)
  const nextDuration = getPhaseDurationSeconds(nextPhase, settings)

  const completedSession: CompletedPomodoroSessionData = {
    taskId: state.currentTaskId,
    type: state.phase,
    durationSeconds: state.targetDurationSeconds,
    targetDurationSeconds: state.targetDurationSeconds,
    startedAt: state.startedAt ?? new Date(now - state.targetDurationSeconds * 1000).toISOString(),
    endedAt: isoNow,
    completed: true,
  }

  if (settings.autoStartBreaks && state.phase === 'focus') {
    return {
      state: {
        ...state,
        phase: nextPhase,
        status: 'running',
        targetDurationSeconds: nextDuration,
        remainingSeconds: nextDuration,
        startedAt: isoNow,
        targetEndAt: now + nextDuration * 1000,
        elapsedBeforePauseSeconds: 0,
        completedCycles: newCompletedCycles,
      },
      didComplete: true,
      completedSession,
    }
  }

  return {
    state: {
      ...state,
      phase: nextPhase,
      status: 'completed',
      targetDurationSeconds: nextDuration,
      remainingSeconds: nextDuration,
      startedAt: undefined,
      targetEndAt: undefined,
      elapsedBeforePauseSeconds: 0,
      completedCycles: newCompletedCycles,
    },
    didComplete: true,
    completedSession,
  }
}

export function formatTimerDisplay(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(clamped / 60)
  const seconds = clamped % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

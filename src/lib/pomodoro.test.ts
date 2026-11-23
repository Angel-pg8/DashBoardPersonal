import { describe, expect, it } from 'vitest'
import type { PomodoroSettings } from '../db/types'
import {
  createInitialPomodoroState,
  evaluateTimer,
  formatTimerDisplay,
  getPhaseDurationSeconds,
  pauseTimer,
  resetTimer,
  resolveNextPhase,
  resumeTimer,
  setTimerPhase,
  skipToNextPhase,
  startTimer,
} from './pomodoro'

describe('pomodoro logic', () => {
  const customSettings: PomodoroSettings = {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
  }

  it('formats display seconds into MM:SS correctly', () => {
    expect(formatTimerDisplay(0)).toBe('00:00')
    expect(formatTimerDisplay(5)).toBe('00:05')
    expect(formatTimerDisplay(59)).toBe('00:59')
    expect(formatTimerDisplay(60)).toBe('01:00')
    expect(formatTimerDisplay(65)).toBe('01:05')
    expect(formatTimerDisplay(1500)).toBe('25:00')
    expect(formatTimerDisplay(3600)).toBe('60:00')
    expect(formatTimerDisplay(-10)).toBe('00:00')
  })

  it('calculates duration in seconds based on settings', () => {
    expect(getPhaseDurationSeconds('focus', customSettings)).toBe(1500)
    expect(getPhaseDurationSeconds('shortBreak', customSettings)).toBe(300)
    expect(getPhaseDurationSeconds('longBreak', customSettings)).toBe(900)
  })

  it('starts the timer with targetEndAt calculated from current time', () => {
    const state = createInitialPomodoroState(customSettings, 'focus', 'task-123')
    const now = 1_000_000
    const running = startTimer(state, now, '2026-11-23T12:00:00.000Z')

    expect(running.status).toBe('running')
    expect(running.remainingSeconds).toBe(1500)
    expect(running.targetEndAt).toBe(now + 1500 * 1000)
    expect(running.startedAt).toBe('2026-11-23T12:00:00.000Z')
    expect(running.currentTaskId).toBe('task-123')
  })

  it('pauses and resumes without time drift', () => {
    const state = createInitialPomodoroState(customSettings, 'focus')
    const t0 = 1_000_000
    const running = startTimer(state, t0)

    // Advance 500 seconds (now = t0 + 500_000)
    const tPause = t0 + 500_000
    const paused = pauseTimer(running, tPause)

    expect(paused.status).toBe('paused')
    expect(paused.remainingSeconds).toBe(1000)
    expect(paused.elapsedBeforePauseSeconds).toBe(500)
    expect(paused.targetEndAt).toBeUndefined()

    // Stay paused for 1 hour (3_600_000 ms)
    const tResume = tPause + 3_600_000
    const resumed = resumeTimer(paused, tResume)

    expect(resumed.status).toBe('running')
    expect(resumed.remainingSeconds).toBe(1000)
    // The new targetEndAt should be tResume + 1000 * 1000, exactly 1000s left!
    expect(resumed.targetEndAt).toBe(tResume + 1000 * 1000)
  })

  it('resets timer to initial phase duration', () => {
    const state = createInitialPomodoroState(customSettings, 'focus')
    const running = startTimer(state, 1_000_000)
    const paused = pauseTimer(running, 1_200_000)
    const reset = resetTimer(paused, customSettings)

    expect(reset.status).toBe('idle')
    expect(reset.remainingSeconds).toBe(1500)
    expect(reset.targetEndAt).toBeUndefined()
    expect(reset.elapsedBeforePauseSeconds).toBe(0)
  })

  it('manually switches phase or skips to next phase', () => {
    const state = createInitialPomodoroState(customSettings, 'focus')
    const switched = setTimerPhase(state, 'shortBreak', customSettings)
    expect(switched.phase).toBe('shortBreak')
    expect(switched.remainingSeconds).toBe(300)

    const skipped = skipToNextPhase(switched, customSettings)
    expect(skipped.phase).toBe('focus')
    expect(skipped.remainingSeconds).toBe(1500)
  })

  it('simulates iOS background suspension (massive time jump) and finishes accurately', () => {
    const state = createInitialPomodoroState(customSettings, 'focus', 'task-abc')
    const t0 = 1_700_000_000_000 // Epoch ms
    const running = startTimer(state, t0, '2026-11-23T12:00:00.000Z')

    // 1 minute in: 24 minutes left
    const eval1 = evaluateTimer(running, customSettings, t0 + 60_000)
    expect(eval1.didComplete).toBe(false)
    expect(eval1.state.remainingSeconds).toBe(1440)

    // User locks iPhone for 25 minutes (no setInterval ticks while device sleeps).
    // User unlocks iPhone at t0 + 1500s (1_500_000 ms).
    const tWake = t0 + 1_500_000
    const evalWake = evaluateTimer(running, customSettings, tWake, '2026-11-23T12:25:00.000Z')

    expect(evalWake.didComplete).toBe(true)
    expect(evalWake.state.remainingSeconds).toBe(300) // Next phase (short break) duration ready
    expect(evalWake.state.phase).toBe('shortBreak')
    expect(evalWake.state.status).toBe('completed')
    expect(evalWake.state.completedCycles).toBe(1)

    // Verify session record generated for saving to Dexie
    expect(evalWake.completedSession).toEqual({
      taskId: 'task-abc',
      type: 'focus',
      durationSeconds: 1500,
      targetDurationSeconds: 1500,
      startedAt: '2026-11-23T12:00:00.000Z',
      endedAt: '2026-11-23T12:25:00.000Z',
      completed: true,
    })
  })

  it('handles late unlock (user unlocks after session has ended) without negative numbers', () => {
    const state = createInitialPomodoroState(customSettings, 'focus')
    const t0 = 1_000_000
    const running = startTimer(state, t0)

    // Unlocked 35 minutes after start (10 minutes late)
    const tLate = t0 + 35 * 60 * 1000
    const evaluated = evaluateTimer(running, customSettings, tLate)

    expect(evaluated.didComplete).toBe(true)
    expect(evaluated.state.remainingSeconds).toBe(300) // Prepares 5m short break
    expect(evaluated.state.status).toBe('completed')
    expect(evaluated.completedSession?.completed).toBe(true)
    expect(evaluated.completedSession?.durationSeconds).toBe(1500)
  })

  it('cycles through 4 focus sessions before offering a long break', () => {
    expect(resolveNextPhase('focus', 1, 4)).toBe('shortBreak')
    expect(resolveNextPhase('focus', 2, 4)).toBe('shortBreak')
    expect(resolveNextPhase('focus', 3, 4)).toBe('shortBreak')
    expect(resolveNextPhase('focus', 4, 4)).toBe('longBreak')
    expect(resolveNextPhase('focus', 5, 4)).toBe('shortBreak')
    expect(resolveNextPhase('focus', 8, 4)).toBe('longBreak')
    expect(resolveNextPhase('shortBreak', 4, 4)).toBe('focus')
    expect(resolveNextPhase('longBreak', 4, 4)).toBe('focus')
  })

  it('auto-starts breaks when autoStartBreaks is true', () => {
    const autoSettings: PomodoroSettings = {
      ...customSettings,
      autoStartBreaks: true,
    }

    const state = createInitialPomodoroState(autoSettings, 'focus')
    const t0 = 1_000_000
    const running = startTimer(state, t0, '2026-11-23T12:00:00.000Z')

    const tEnd = t0 + 1500 * 1000
    const evaluated = evaluateTimer(running, autoSettings, tEnd, '2026-11-23T12:25:00.000Z')

    expect(evaluated.didComplete).toBe(true)
    expect(evaluated.state.phase).toBe('shortBreak')
    expect(evaluated.state.status).toBe('running') // Auto-started!
    expect(evaluated.state.remainingSeconds).toBe(300)
    expect(evaluated.state.targetEndAt).toBe(tEnd + 300 * 1000)
  })

  it('does not auto-start breaks when autoStartBreaks is false (default)', () => {
    const manualSettings: PomodoroSettings = {
      ...customSettings,
      autoStartBreaks: false,
    }

    const state = createInitialPomodoroState(manualSettings, 'focus')
    const t0 = 1_000_000
    const running = startTimer(state, t0)

    const tEnd = t0 + 1500 * 1000
    const evaluated = evaluateTimer(running, manualSettings, tEnd)

    expect(evaluated.didComplete).toBe(true)
    expect(evaluated.state.phase).toBe('shortBreak')
    expect(evaluated.state.status).toBe('completed') // In waiting state
    expect(evaluated.state.targetEndAt).toBeUndefined()
  })
})

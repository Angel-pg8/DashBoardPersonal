import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { remainingToastMs, TOAST_DURATION_MS } from '../../lib/toast'

type ToastProps = {
  message: string
  actionLabel?: string
  onAction?: () => void
  onDismiss: () => void
}

/** Aviso con acción opcional: se cierra solo a los ~6 s, se pausa mientras se toca y no se apila. */
export function Toast({ message, actionLabel, onAction, onDismiss }: ToastProps): JSX.Element {
  const [paused, setPaused] = useState(false)
  const remainingRef = useRef(TOAST_DURATION_MS)
  const startedRef = useRef(0)
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  useEffect(() => {
    if (paused) return
    startedRef.current = Date.now()
    const timer = window.setTimeout(() => dismissRef.current(), remainingRef.current)
    return () => {
      window.clearTimeout(timer)
      remainingRef.current = remainingToastMs(remainingRef.current, startedRef.current, Date.now())
    }
  }, [paused])

  const pause = (event: ReactPointerEvent<HTMLDivElement>): void => { event.preventDefault(); setPaused(true) }
  const resume = (): void => setPaused(false)

  return (
    <div className={`toast${paused ? ' toast--paused' : ''}`} role="status"
      onPointerDown={pause} onPointerUp={resume} onPointerCancel={resume} onPointerLeave={resume}>
      <span>{message}</span>
      {actionLabel && onAction && <button type="button" onClick={onAction}>{actionLabel}</button>}
      <button type="button" aria-label="Cerrar aviso" onClick={onDismiss}>×</button>
      <span className="toast__progress" aria-hidden="true" />
    </div>
  )
}

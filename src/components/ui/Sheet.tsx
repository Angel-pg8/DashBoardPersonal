import { useEffect, useRef, useState, type CSSProperties, type MutableRefObject, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { resolveSheetDrag, sheetDragThreshold } from '../../lib/sheet'

const closeAnimationMs = 200
const releaseAnimationMs = 200

type SheetProps = {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  /** Devuelve false para cancelar el cierre (por ejemplo, si hay datos sin guardar). */
  onBeforeClose?: () => boolean
  /** Recibe el elemento que se desplaza; útil para subir el scroll desde fuera. */
  contentRef?: MutableRefObject<HTMLElement | null>
}

export function Sheet({ open, title, children, onClose, onBeforeClose, contentRef }: SheetProps): JSX.Element | null {
  const sheetRef = useRef<HTMLElement | null>(null)
  const [closing, setClosing] = useState(false)
  const [drag, setDrag] = useState<{ y: number; active: boolean } | null>(null)
  const dragStartY = useRef(0)
  const dragMoved = useRef(false)
  const dragActive = useRef(false)
  const closeTimer = useRef<number | null>(null)

  // Congela el fondo mientras el sheet está abierto (incluido Safari iOS) y lo restaura al cerrar.
  useEffect(() => {
    if (!open) return
    const scrollY = window.scrollY
    const { body } = document
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    }
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    return () => {
      body.style.overflow = previous.overflow
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.left = previous.left
      body.style.right = previous.right
      body.style.width = previous.width
      window.scrollTo(0, scrollY)
    }
  }, [open])

  useEffect(() => () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current)
  }, [])

  function requestClose(): void {
    if (closing) return
    if (onBeforeClose && !onBeforeClose()) return
    setDrag(null)
    setClosing(true)
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null
      setClosing(false)
      onClose()
    }, closeAnimationMs)
  }

  function onHandlePointerDown(event: ReactPointerEvent<HTMLDivElement>): void {
    if (closing) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStartY.current = event.clientY
    dragMoved.current = false
    dragActive.current = true
    setDrag({ y: 0, active: true })
  }

  function onHandlePointerMove(event: ReactPointerEvent<HTMLDivElement>): void {
    if (!dragActive.current) return
    const y = event.clientY - dragStartY.current
    if (Math.abs(y) > 4) dragMoved.current = true
    setDrag({ y: Math.max(0, y), active: true })
  }

  function releaseDrag(y: number): void {
    dragActive.current = false
    setDrag({ y, active: false })
    window.setTimeout(() => setDrag((current) => current && !current.active ? null : current), releaseAnimationMs)
  }

  function onHandlePointerUp(event: ReactPointerEvent<HTMLDivElement>): void {
    if (!dragActive.current) return
    const y = Math.max(0, event.clientY - dragStartY.current)
    const threshold = sheetDragThreshold(sheetRef.current?.offsetHeight ?? 0)
    const result = resolveSheetDrag(y, dragMoved.current, threshold)
    if (result === 'close') { releaseDrag(y); requestClose(); return }
    if (result === 'tap') { releaseDrag(0); requestClose(); return }
    releaseDrag(y)
  }

  function onHandlePointerCancel(): void {
    if (!dragActive.current) return
    releaseDrag(0)
  }

  let sheetStyle: CSSProperties | undefined
  if (!closing && drag) {
    sheetStyle = drag.active
      ? { transform: `translateY(${drag.y}px)`, transition: 'none' }
      : { transform: `translateY(${drag.y}px)` }
  }

  if (!open) return null
  return (
    <div className={`sheet-backdrop${closing ? ' sheet-backdrop--closing' : ''}`} role="presentation" onPointerDown={requestClose}>
      <section
        ref={(node) => { sheetRef.current = node; if (contentRef) contentRef.current = node }}
        className={`sheet${closing ? ' sheet--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        style={sheetStyle}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="sheet__handle" aria-hidden="true"
          onPointerDown={onHandlePointerDown} onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp} onPointerCancel={onHandlePointerCancel} />
        <div className="sheet__header">
          <h2 id="sheet-title">{title}</h2>
          <button type="button" className="icon-button" onClick={requestClose} aria-label="Cerrar">×</button>
        </div>
        {children}
      </section>
    </div>
  )
}

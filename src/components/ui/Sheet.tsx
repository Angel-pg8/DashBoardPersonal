import type { ReactNode } from 'react'

export function Sheet({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null
  return <div className="sheet-backdrop" role="presentation" onMouseDown={onClose}><section className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" onMouseDown={(event) => event.stopPropagation()}><div className="sheet__handle" /><div className="sheet__header"><h2 id="sheet-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="Cerrar">×</button></div>{children}</section></div>
}

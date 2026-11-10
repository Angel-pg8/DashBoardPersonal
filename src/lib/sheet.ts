export type SheetDragResult = 'close' | 'tap' | 'revert'

/** Umbral mínimo y proporción de la altura del sheet para considerar el arrastre como cierre. */
export function sheetDragThreshold(sheetHeightPx: number): number {
  if (sheetHeightPx <= 0) return 72
  return Math.max(72, Math.round(sheetHeightPx * 0.18))
}

/**
 * Decide qué hacer al soltar la muesca del sheet.
 * Sin movimiento real es un toque (cerrar); con movimiento se cierra solo
 * si se superó el umbral hacia abajo; en otro caso vuelve a su sitio.
 */
export function resolveSheetDrag(deltaYPx: number, moved: boolean, thresholdPx: number): SheetDragResult {
  if (!moved) return 'tap'
  if (deltaYPx >= thresholdPx) return 'close'
  return 'revert'
}

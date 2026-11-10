import { describe, expect, it } from 'vitest'
import { resolveSheetDrag, sheetDragThreshold } from './sheet'

describe('sheet drag to close', () => {
  it('closes when the downward drag passes the threshold', () => {
    expect(resolveSheetDrag(120, true, 90)).toBe('close')
  })

  it('reverts when the drag stops short of the threshold', () => {
    expect(resolveSheetDrag(40, true, 90)).toBe('revert')
  })

  it('never closes on an upward drag', () => {
    expect(resolveSheetDrag(-30, true, 90)).toBe('revert')
  })

  it('treats a still pointer as a tap on the notch', () => {
    expect(resolveSheetDrag(0, false, 90)).toBe('tap')
    expect(resolveSheetDrag(2, false, 90)).toBe('tap')
  })
})

describe('sheet drag threshold', () => {
  it('uses at least 72 px so short sheets stay closable', () => {
    expect(sheetDragThreshold(0)).toBe(72)
    expect(sheetDragThreshold(200)).toBe(72)
  })

  it('grows with the height of the sheet', () => {
    expect(sheetDragThreshold(640)).toBe(115)
    expect(sheetDragThreshold(1000)).toBe(180)
  })
})

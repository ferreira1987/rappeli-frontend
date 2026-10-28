import { describe, expect, it } from 'vitest'

import {
  FUNNEL_POINTER_DRAG_THRESHOLD_PX,
  pointerDragExceededThreshold,
} from '@/utils/funnelPointerDrag'

describe('funnelPointerDrag', () => {
  it('requires movement beyond threshold before drag starts', () => {
    const t = FUNNEL_POINTER_DRAG_THRESHOLD_PX
    expect(pointerDragExceededThreshold(t - 1, 0)).toBe(false)
    expect(pointerDragExceededThreshold(t, 0)).toBe(true)
    expect(pointerDragExceededThreshold(3, 3)).toBe(false)
    expect(pointerDragExceededThreshold(5, 5)).toBe(true)
  })
})

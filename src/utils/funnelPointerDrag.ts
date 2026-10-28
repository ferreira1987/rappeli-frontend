export const FUNNEL_POINTER_DRAG_THRESHOLD_PX = 6

export function pointerDragExceededThreshold(
  deltaX: number,
  deltaY: number,
  thresholdPx = FUNNEL_POINTER_DRAG_THRESHOLD_PX,
): boolean {
  return deltaX * deltaX + deltaY * deltaY >= thresholdPx * thresholdPx
}

export function findFunnelColumnAtPoint(clientX: number, clientY: number): HTMLElement | null {
  const target = document.elementFromPoint(clientX, clientY)
  return target?.closest<HTMLElement>('[data-funnel-column]') ?? null
}

export function readFunnelColumnId(column: HTMLElement): number | null {
  const stageId = Number(column.dataset.funnelColumnId)
  return Number.isFinite(stageId) ? stageId : null
}

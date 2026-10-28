import { ref, type Ref } from 'vue'

import { moveFunnelCard } from '@/api/funnel'
import type { FunnelCard, FunnelStage } from '@/types/funnel'
import {
  findCardLocation,
  keyboardTargetFromArrow,
  moveCardInStages,
  resolveDropIndex,
} from '@/utils/funnelBoardMove'
import { getErrorMessage } from '@/utils/errors'

export type DropPreview = {
  stageId: number
  index: number
}

export function useFunnelKanbanDnD(
  stages: Ref<FunnelStage[]>,
  options: {
    disabled?: Ref<boolean>
    onStatus?: (message: string | null) => void
  } = {},
) {
  const draggedCardId = ref<number | null>(null)
  const dropPreview = ref<DropPreview | null>(null)
  const keyboardGrab = ref<{ cardId: number; stageId: number; index: number } | null>(null)
  const moving = ref(false)
  const pointerDragActive = ref(false)

  let pointerCleanup: (() => void) | null = null

  function clearDragState(): void {
    draggedCardId.value = null
    dropPreview.value = null
    pointerDragActive.value = false
    pointerCleanup?.()
    pointerCleanup = null
  }

  function setDropPreview(stageId: number, columnEl: HTMLElement, clientY: number): void {
    if (draggedCardId.value == null) return
    const cardEls = Array.from(columnEl.querySelectorAll<HTMLElement>('[data-funnel-card]'))
    const index = resolveDropIndex(cardEls, clientY, draggedCardId.value)
    dropPreview.value = { stageId, index }
  }

  async function commitMove(cardId: number, stageId: number, index: number): Promise<void> {
    if (options.disabled?.value) return
    const before = stages.value.map((s) => ({ ...s, cards: [...(s.cards ?? [])] }))
    const optimistic = moveCardInStages(stages.value, cardId, stageId, index)
    if (!optimistic) return

    stages.value = optimistic
    moving.value = true
    options.onStatus?.(null)
    try {
      await moveFunnelCard(cardId, { funnel_stage_id: stageId, position: index })
    } catch (err) {
      stages.value = before
      options.onStatus?.(getErrorMessage(err))
    } finally {
      moving.value = false
    }
  }

  function onDragStart(card: FunnelCard, event: DragEvent): void {
    if (options.disabled?.value) {
      event.preventDefault()
      return
    }
    draggedCardId.value = card.id
    dropPreview.value = { stageId: card.funnel_stage_id, index: findCardLocation(stages.value, card.id)?.index ?? 0 }
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(card.id))
    }
  }

  function onDragOver(stageId: number, event: DragEvent): void {
    event.preventDefault()
    const column = event.currentTarget as HTMLElement | null
    if (!column || draggedCardId.value == null) return
    setDropPreview(stageId, column, event.clientY)
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  }

  async function onDrop(stageId: number, event: DragEvent): Promise<void> {
    event.preventDefault()
    const cardId = draggedCardId.value
    const preview = dropPreview.value
    clearDragState()
    if (cardId == null || !preview || preview.stageId !== stageId) return
    await commitMove(cardId, stageId, preview.index)
  }

  function onDragEnd(): void {
    clearDragState()
  }

  function startPointerDrag(card: FunnelCard, event: PointerEvent): void {
    if (options.disabled?.value) return
    if (event.pointerType === 'mouse') return
    if (event.button !== 0) return

    draggedCardId.value = card.id
    pointerDragActive.value = true
    dropPreview.value = {
      stageId: card.funnel_stage_id,
      index: findCardLocation(stages.value, card.id)?.index ?? 0,
    }

    const onMove = (e: PointerEvent): void => {
      const target = document.elementFromPoint(e.clientX, e.clientY)
      const column = target?.closest<HTMLElement>('[data-funnel-column]')
      if (column) {
        const stageId = Number(column.dataset.funnelColumnId)
        if (Number.isFinite(stageId)) setDropPreview(stageId, column, e.clientY)
      }
    }

    const onUp = async (): Promise<void> => {
      const preview = dropPreview.value
      const cardId = draggedCardId.value
      clearDragState()
      if (cardId != null && preview) {
        await commitMove(cardId, preview.stageId, preview.index)
      }
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    pointerCleanup = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
    event.preventDefault()
  }

  function onGripKeydown(card: FunnelCard, stageId: number, event: KeyboardEvent): void {
    if (options.disabled?.value) return

    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault()
      const loc = findCardLocation(stages.value, card.id)
      if (!loc) return
      if (keyboardGrab.value?.cardId === card.id) {
        keyboardGrab.value = null
        dropPreview.value = null
        return
      }
      keyboardGrab.value = { cardId: card.id, stageId: loc.stageId, index: loc.index }
      dropPreview.value = { stageId: loc.stageId, index: loc.index }
      return
    }

    if (!keyboardGrab.value || keyboardGrab.value.cardId !== card.id) return

    if (event.key === 'Escape') {
      event.preventDefault()
      keyboardGrab.value = null
      dropPreview.value = null
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const preview = dropPreview.value
      keyboardGrab.value = null
      dropPreview.value = null
      if (preview) void commitMove(card.id, preview.stageId, preview.index)
      return
    }

    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    const preview = dropPreview.value
    if (!preview) return
    dropPreview.value = keyboardTargetFromArrow(
      stages.value,
      preview.stageId,
      preview.index,
      event.key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight',
    )
  }

  function isDragging(cardId: number): boolean {
    return draggedCardId.value === cardId || keyboardGrab.value?.cardId === cardId
  }

  function isDropBefore(stageId: number, cardIndex: number): boolean {
    const p = dropPreview.value
    return p != null && p.stageId === stageId && p.index === cardIndex
  }

  function isDropAtEnd(stageId: number, cardCount: number): boolean {
    const p = dropPreview.value
    return p != null && p.stageId === stageId && p.index === cardCount
  }

  return {
    draggedCardId,
    dropPreview,
    keyboardGrab,
    moving,
    pointerDragActive,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    startPointerDrag,
    onGripKeydown,
    isDragging,
    isDropBefore,
    isDropAtEnd,
    clearDragState,
  }
}

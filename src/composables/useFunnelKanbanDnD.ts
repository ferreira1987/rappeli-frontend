import { ref, type Ref } from 'vue'

import { moveFunnelCard } from '@/api/funnel'
import type { FunnelCard, FunnelStage } from '@/types/funnel'
import {
  findCardLocation,
  keyboardTargetFromArrow,
  moveCardInStages,
  resolveDropIndex,
} from '@/utils/funnelBoardMove'
import {
  findFunnelColumnAtPoint,
  pointerDragExceededThreshold,
  readFunnelColumnId,
} from '@/utils/funnelPointerDrag'
import { getErrorMessage } from '@/utils/errors'

export type DropPreview = {
  stageId: number
  index: number
}

export type PointerGhost = {
  label: string
  left: number
  top: number
  width: number
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
  const pointerGhost = ref<PointerGhost | null>(null)
  const liveAnnouncement = ref('')

  let pointerCleanup: (() => void) | null = null

  function stageTitle(stageId: number): string {
    return stages.value.find((s) => s.id === stageId)?.title ?? 'etapa'
  }

  function announce(message: string): void {
    liveAnnouncement.value = message
  }

  function clearDragState(): void {
    draggedCardId.value = null
    dropPreview.value = null
    pointerDragActive.value = false
    pointerGhost.value = null
    pointerCleanup?.()
    pointerCleanup = null
  }

  function setDropPreview(stageId: number, columnEl: HTMLElement, clientY: number): void {
    if (draggedCardId.value == null) return
    const cardEls = Array.from(columnEl.querySelectorAll<HTMLElement>('[data-funnel-card]'))
    const index = resolveDropIndex(cardEls, clientY, draggedCardId.value)
    const prev = dropPreview.value
    dropPreview.value = { stageId, index }
    if (prev?.stageId !== stageId) {
      announce(`Mover para ${stageTitle(stageId)}, posição ${index + 1}.`)
    }
  }

  function updatePointerGhost(cardEl: HTMLElement, clientX: number, clientY: number, label: string): void {
    const rect = cardEl.getBoundingClientRect()
    pointerGhost.value = {
      label,
      left: clientX - rect.width / 2,
      top: clientY - 16,
      width: rect.width,
    }
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
      announce(`Card solto em ${stageTitle(stageId)}, posição ${index + 1}.`)
    } catch (err) {
      stages.value = before
      options.onStatus?.(getErrorMessage(err))
      announce('Não foi possível salvar a nova posição do card.')
    } finally {
      moving.value = false
    }
  }

  function startPointerDrag(card: FunnelCard, event: PointerEvent): void {
    if (options.disabled?.value) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    const startX = event.clientX
    const startY = event.clientY
    const gripEl = event.currentTarget as HTMLElement | null
    const cardEl = gripEl?.closest<HTMLElement>('[data-funnel-card]') ?? null
    const cardLabel = card.contact_name || 'Contato'
    let dragStarted = false

    const onMove = (e: PointerEvent): void => {
      if (!dragStarted) {
        if (!pointerDragExceededThreshold(e.clientX - startX, e.clientY - startY)) return
        dragStarted = true
        draggedCardId.value = card.id
        pointerDragActive.value = true
        const loc = findCardLocation(stages.value, card.id)
        dropPreview.value = {
          stageId: loc?.stageId ?? card.funnel_stage_id,
          index: loc?.index ?? 0,
        }
        announce(`Card ${cardLabel} pegado. Arraste para outra etapa ou posição.`)
      }

      if (cardEl) updatePointerGhost(cardEl, e.clientX, e.clientY, cardLabel)

      const column = findFunnelColumnAtPoint(e.clientX, e.clientY)
      if (!column) return
      const stageId = readFunnelColumnId(column)
      if (stageId == null) return
      setDropPreview(stageId, column, e.clientY)
    }

    const onUp = async (): Promise<void> => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      pointerCleanup = null

      if (!dragStarted) return

      const preview = dropPreview.value
      const cardId = draggedCardId.value
      const origin = findCardLocation(stages.value, card.id)
      clearDragState()

      if (cardId == null || !preview) {
        announce('Movimento cancelado.')
        return
      }

      if (origin && origin.stageId === preview.stageId && origin.index === preview.index) {
        announce('Card mantido na mesma posição.')
        return
      }

      await commitMove(cardId, preview.stageId, preview.index)
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
    const cardLabel = card.contact_name || 'Contato'

    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault()
      const loc = findCardLocation(stages.value, card.id)
      if (!loc) return
      if (keyboardGrab.value?.cardId === card.id) {
        keyboardGrab.value = null
        dropPreview.value = null
        announce('Seleção de movimento cancelada.')
        return
      }
      keyboardGrab.value = { cardId: card.id, stageId: loc.stageId, index: loc.index }
      dropPreview.value = { stageId: loc.stageId, index: loc.index }
      announce(`Card ${cardLabel} pegado. Use as setas para mover e Enter para soltar.`)
      return
    }

    if (!keyboardGrab.value || keyboardGrab.value.cardId !== card.id) return

    if (event.key === 'Escape') {
      event.preventDefault()
      keyboardGrab.value = null
      dropPreview.value = null
      announce('Movimento cancelado.')
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
    const next = keyboardTargetFromArrow(
      stages.value,
      preview.stageId,
      preview.index,
      event.key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight',
    )
    dropPreview.value = next
    announce(`Mover para ${stageTitle(next.stageId)}, posição ${next.index + 1}.`)
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
    pointerGhost,
    liveAnnouncement,
    startPointerDrag,
    onGripKeydown,
    isDragging,
    isDropBefore,
    isDropAtEnd,
    clearDragState,
  }
}

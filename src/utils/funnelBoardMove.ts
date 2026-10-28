import type { FunnelCard, FunnelStage } from '@/types/funnel'

export function sortStageCards(cards: FunnelCard[]): FunnelCard[] {
  return [...cards].sort((a, b) => a.position - b.position || a.id - b.id)
}

export function stagesFromApi(stages: FunnelStage[]): FunnelStage[] {
  return normalizeStagePositions(
    stages.map((stage) => ({ ...stage, cards: sortStageCards(stage.cards ?? []) })),
  )
}

export function normalizeStagePositions(stages: FunnelStage[]): FunnelStage[] {
  return stages.map((stage) => {
    const cards = [...(stage.cards ?? [])].map((card, index) => ({
      ...card,
      funnel_stage_id: stage.id,
      position: index,
    }))
    return { ...stage, cards }
  })
}

export type CardLocation = {
  stageId: number
  index: number
  card: FunnelCard
}

export function findCardLocation(stages: FunnelStage[], cardId: number): CardLocation | null {
  for (const stage of stages) {
    const cards = sortStageCards(stage.cards ?? [])
    const index = cards.findIndex((c) => c.id === cardId)
    if (index >= 0) {
      const card = cards[index]
      if (!card) return null
      return { stageId: stage.id, index, card }
    }
  }
  return null
}

/** Move a card to another stage/index in a local board snapshot (optimistic UI). */
export function moveCardInStages(
  stages: FunnelStage[],
  cardId: number,
  targetStageId: number,
  targetIndex: number,
): FunnelStage[] | null {
  const location = findCardLocation(stages, cardId)
  if (!location) return null

  let insertIndex = targetIndex
  if (location.stageId === targetStageId && location.index < insertIndex) {
    insertIndex -= 1
  }

  const next = stages.map((stage) => ({
    ...stage,
    cards: sortStageCards(stage.cards ?? []).filter((c) => c.id !== cardId),
  }))

  const targetStage = next.find((s) => s.id === targetStageId)
  if (!targetStage) return null

  const targetCards = [...(targetStage.cards ?? [])]
  const clampedIndex = Math.max(0, Math.min(insertIndex, targetCards.length))
  const moved: FunnelCard = {
    ...location.card,
    funnel_stage_id: targetStageId,
  }
  targetCards.splice(clampedIndex, 0, moved)
  targetStage.cards = targetCards

  return normalizeStagePositions(next)
}

export function resolveDropIndex(
  cardElements: HTMLElement[],
  clientY: number,
  draggedCardId: number | null,
): number {
  const visible = cardElements.filter((el) => {
    const id = Number(el.dataset.funnelCardId)
    return !draggedCardId || id !== draggedCardId
  })

  for (let i = 0; i < visible.length; i++) {
    const el = visible[i]
    if (!el) continue
    const rect = el.getBoundingClientRect()
    const mid = rect.top + rect.height / 2
    if (clientY < mid) return i
  }
  return visible.length
}

export function keyboardTargetFromArrow(
  stages: FunnelStage[],
  stageId: number,
  index: number,
  key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight',
): { stageId: number; index: number } {
  const stageIndex = stages.findIndex((s) => s.id === stageId)
  if (stageIndex < 0) return { stageId, index }

  const count = sortStageCards(stages[stageIndex]?.cards ?? []).length

  if (key === 'ArrowUp') {
    return { stageId, index: Math.max(0, index - 1) }
  }
  if (key === 'ArrowDown') {
    return { stageId, index: Math.min(count, index + 1) }
  }
  if (key === 'ArrowLeft') {
    const prev = stages[Math.max(0, stageIndex - 1)]
    const prevCount = sortStageCards(prev?.cards ?? []).length
    return { stageId: prev?.id ?? stageId, index: Math.min(index, prevCount) }
  }
  const next = stages[Math.min(stages.length - 1, stageIndex + 1)]
  const nextCount = sortStageCards(next?.cards ?? []).length
  return { stageId: next?.id ?? stageId, index: Math.min(index, nextCount) }
}

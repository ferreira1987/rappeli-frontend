import { describe, expect, it } from 'vitest'

import type { FunnelCard, FunnelStage } from '@/types/funnel'
import {
  findCardLocation,
  moveCardInStages,
  normalizeStagePositions,
  resolveDropIndex,
  sortStageCards,
} from '@/utils/funnelBoardMove'

function card(id: number, stageId: number, position: number): FunnelCard {
  return {
    id,
    funnel_stage_id: stageId,
    contact_id: null,
    conversation_id: null,
    assigned_user_id: null,
    contact_name: `C${id}`,
    phone: null,
    last_message: null,
    tags: [],
    position,
  }
}

function board(): FunnelStage[] {
  return [
    { id: 1, slug: 'a', title: 'A', color: null, position: 0, cards: [card(10, 1, 0), card(11, 1, 1)] },
    { id: 2, slug: 'b', title: 'B', color: null, position: 1, cards: [card(20, 2, 0)] },
  ]
}

describe('funnelBoardMove', () => {
  it('sorts cards by position then id', () => {
    const sorted = sortStageCards([card(2, 1, 1), card(1, 1, 0)])
    expect(sorted.map((c) => c.id)).toEqual([1, 2])
  })

  it('finds card location', () => {
    const loc = findCardLocation(board(), 11)
    expect(loc).toEqual({ stageId: 1, index: 1, card: card(11, 1, 1) })
  })

  it('moves card across columns and reindexes positions', () => {
    const next = moveCardInStages(board(), 11, 2, 1)
    expect(next).not.toBeNull()
    const stage2 = next!.find((s) => s.id === 2)!
    expect(stage2.cards!.map((c) => c.id)).toEqual([20, 11])
    expect(stage2.cards![1]?.position).toBe(1)
    const stage1 = next!.find((s) => s.id === 1)!
    expect(stage1.cards!.map((c) => c.id)).toEqual([10])
  })

  it('reorders within the same column', () => {
    const next = moveCardInStages(board(), 10, 1, 2)
    expect(next!.find((s) => s.id === 1)!.cards!.map((c) => c.id)).toEqual([11, 10])
  })

  it('normalizeStagePositions assigns contiguous positions', () => {
    const normalized = normalizeStagePositions(board())
    expect(normalized[0]!.cards!.map((c) => c.position)).toEqual([0, 1])
  })

  it('resolveDropIndex picks slot from pointer Y', () => {
    const el1 = document.createElement('div')
    el1.dataset.funnelCardId = '1'
    Object.defineProperty(el1, 'getBoundingClientRect', {
      value: () => ({ top: 0, height: 40, bottom: 40, left: 0, right: 0, width: 100, x: 0, y: 0, toJSON: () => ({}) }),
    })
    const el2 = document.createElement('div')
    el2.dataset.funnelCardId = '2'
    Object.defineProperty(el2, 'getBoundingClientRect', {
      value: () => ({ top: 50, height: 40, bottom: 90, left: 0, right: 0, width: 100, x: 0, y: 50, toJSON: () => ({}) }),
    })
    expect(resolveDropIndex([el1, el2], 10, null)).toBe(0)
    expect(resolveDropIndex([el1, el2], 45, null)).toBe(1)
    expect(resolveDropIndex([el1, el2], 100, null)).toBe(2)
  })
})

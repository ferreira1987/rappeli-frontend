import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, h, ref } from 'vue'

import FunnelKanbanBoard from '@/components/funnel/FunnelKanbanBoard.vue'
import type { FunnelCard, FunnelStage } from '@/types/funnel'
import { FUNNEL_POINTER_DRAG_THRESHOLD_PX } from '@/utils/funnelPointerDrag'

const moveFunnelCard = vi.fn()

vi.mock('@/api/funnel', () => ({
  moveFunnelCard: (...args: unknown[]) => moveFunnelCard(...args),
}))

vi.mock('vue-router', () => ({
  RouterLink: defineComponent({
    props: { to: { type: [String, Object], required: true } },
    setup(_, { slots }) {
      return () => h('a', slots.default?.())
    },
  }),
}))

function card(id: number, stageId: number, position: number, name: string): FunnelCard {
  return {
    id,
    funnel_stage_id: stageId,
    contact_id: null,
    conversation_id: null,
    assigned_user_id: null,
    contact_name: name,
    phone: null,
    last_message: null,
    tags: [],
    position,
  }
}

function mountBoard() {
  const stages = ref<FunnelStage[]>([
    { id: 1, slug: 'a', title: 'Novos', color: null, position: 0, cards: [card(10, 1, 0, 'Lead A')] },
    { id: 2, slug: 'b', title: 'Negociação', color: null, position: 1, cards: [card(20, 2, 0, 'Lead B')] },
  ])

  const cardsByStage = computedMap(stages)

  const wrapper = mount(FunnelKanbanBoard, {
    props: {
      stages: stages.value,
      cardsByStage,
      dragDisabled: false,
      'onUpdate:stages': (value: FunnelStage[]) => {
        stages.value = value
        wrapper.setProps({ stages: value, cardsByStage: computedMap(stages) })
      },
    },
    global: {
      stubs: { Teleport: true },
    },
  })

  return { wrapper, stages }
}

function computedMap(stages: { value: FunnelStage[] }): Map<number, FunnelCard[]> {
  const map = new Map<number, FunnelCard[]>()
  for (const stage of stages.value) {
    map.set(stage.id, [...(stage.cards ?? [])])
  }
  return map
}

describe('useFunnelKanbanDnD (pointer mouse)', () => {
  beforeEach(() => {
    moveFunnelCard.mockReset()
    moveFunnelCard.mockResolvedValue({ id: 10, funnel_stage_id: 2, position: 0 })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('commits move after pointer drag from grip across columns', async () => {
    const { wrapper, stages } = mountBoard()

    const columnDest = wrapper.find('[data-funnel-column-id="2"]').element as HTMLElement
    const elementFromPoint = vi.fn(() => columnDest)
    vi.stubGlobal(
      'document',
      new Proxy(document, {
        get(target, prop, receiver) {
          if (prop === 'elementFromPoint') return elementFromPoint
          return Reflect.get(target, prop, receiver)
        },
      }),
    )

    const gripEl = wrapper.find('[data-funnel-grip]').element
    const movePx = FUNNEL_POINTER_DRAG_THRESHOLD_PX + 4

    gripEl.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 40, clientY: 40, bubbles: true }),
    )
    window.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 40 + movePx, clientY: 200 }),
    )
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'mouse', clientX: 200, clientY: 200 }))

    await flushPromises()

    expect(moveFunnelCard).toHaveBeenCalledWith(10, { funnel_stage_id: 2, position: 1 })
    expect(stages.value.find((s) => s.id === 2)?.cards?.some((c) => c.id === 10)).toBe(true)
    expect(wrapper.find('[aria-live="polite"]').text()).toMatch(/solt/i)
  })
})

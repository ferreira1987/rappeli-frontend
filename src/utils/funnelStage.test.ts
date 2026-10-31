import { describe, expect, it } from 'vitest'

import { funnelTagBadgeVariant, isFunnelWonStage } from '@/utils/funnelStage'

describe('funnelStage', () => {
  it('detects won stages from slug, title, or color', () => {
    expect(isFunnelWonStage({ id: 1, slug: 'fechado', title: 'X', color: null, position: 0 })).toBe(true)
    expect(isFunnelWonStage({ id: 2, slug: 'x', title: 'Fechado', color: null, position: 0 })).toBe(true)
    expect(isFunnelWonStage({ id: 3, slug: 'x', title: 'Y', color: 'text-emerald-600', position: 0 })).toBe(
      true,
    )
    expect(isFunnelWonStage({ id: 4, slug: 'novo', title: 'Novo lead', color: null, position: 0 })).toBe(false)
  })

  it('highlights proposal-like tags', () => {
    expect(funnelTagBadgeVariant('Plano Proposta R$ 547')).toBe('primary')
    expect(funnelTagBadgeVariant('WhatsApp direto')).toBe('neutral')
  })
})

import { describe, expect, it } from 'vitest'

import { buildExampleCampaigns } from '@/mocks/campaignBuilder'

describe('buildExampleCampaigns', () => {
  const reference = new Date('2026-10-27T12:00:00')

  it('aligns retorno preventivo odonto sent count with reports source', () => {
    const campaigns = buildExampleCampaigns(reference)
    const odonto = campaigns.find((c) => c.id === 'c4')
    expect(odonto?.sent).toBe(310)
    expect(odonto?.status).toBe('concluida')
  })

  it('marks past scheduled mass confirmation as concluded, not agendada', () => {
    const campaigns = buildExampleCampaigns(reference)
    const mass = campaigns.find((c) => c.id === 'c6')
    expect(mass?.status).toBe('concluida')
  })

  it('uses relative today label without extra absolute date for same-day campaign', () => {
    const campaigns = buildExampleCampaigns(reference)
    const todayCampaign = campaigns.find((c) => c.id === 'c1')
    expect(todayCampaign?.scheduleLabel).toBe('Hoje, 14:00')
  })
})

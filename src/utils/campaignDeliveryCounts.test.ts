import { describe, expect, it } from 'vitest'

import {
  formatCampaignDeliverySummary,
  formatCampaignListEnvioLine,
} from '@/utils/campaignDeliveryCounts'
import type { Campaign } from '@/types/campaigns'

describe('formatCampaignDeliverySummary', () => {
  it('lists sent, delivered, read and failed counts', () => {
    expect(
      formatCampaignDeliverySummary({
        sent_count: 100,
        delivered_count: 95,
        read_count: 40,
        failed_count: 5,
      }),
    ).toBe('100 enviadas · 95 entregues · 40 lidas · 5 falhas')
  })

  it('defaults missing failed_count to zero', () => {
    expect(
      formatCampaignDeliverySummary({
        sent_count: 10,
        delivered_count: 10,
        read_count: 3,
      }),
    ).toBe('10 enviadas · 10 entregues · 3 lidas · 0 falhas')
  })
})

describe('formatCampaignListEnvioLine', () => {
  const base: Pick<Campaign, 'status' | 'sent_count' | 'scheduled_at'> = {
    status: 'rascunho',
    sent_count: 0,
    scheduled_at: null,
  }

  it('describes envio by status', () => {
    expect(formatCampaignListEnvioLine({ ...base, status: 'concluida', sent_count: 120 })).toBe(
      '120 enviados',
    )
    expect(formatCampaignListEnvioLine({ ...base, status: 'rascunho' })).toBe('0 disparos')
    expect(formatCampaignListEnvioLine({ ...base, status: 'enviando', sent_count: 5 })).toBe(
      'Enviando para contatos',
    )
  })

  it('formats scheduled campaigns with locale datetime when possible', () => {
    expect(
      formatCampaignListEnvioLine({
        ...base,
        status: 'agendada',
        scheduled_at: '2026-11-01T14:30:00.000Z',
      }),
    ).toMatch(/^Agendada para /)
  })
})

import { describe, expect, it } from 'vitest'

import { formatCampaignDeliverySummary } from '@/utils/campaignDeliveryCounts'

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

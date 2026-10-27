import { describe, expect, it } from 'vitest'

import { exampleCampaignPerformance, exampleReportKpis } from '@/mocks/reports'
import { exampleCampaigns } from '@/mocks/campaignBuilder'

describe('example report mocks', () => {
  it('derives campaign performance sent totals from exampleCampaigns', () => {
    const odontoCampaign = exampleCampaigns.find((c) => c.name === 'Retorno preventivo odonto')
    const odontoReport = exampleCampaignPerformance.find((c) => c.name === 'Retorno preventivo odonto')
    expect(odontoReport?.sent).toBe(odontoCampaign?.sent)
  })

  it('derives conversations handled KPI from agent table', () => {
    expect(exampleReportKpis.conversationsHandled).toBe(128)
  })
})

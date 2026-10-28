import { describe, expect, it } from 'vitest'

import {
  campaignSendRateOptionsForForm,
  campaignSendRatePayloadValue,
  normalizeCampaignSendRateForForm,
} from '@/utils/campaignSendRate'

describe('normalizeCampaignSendRateForForm', () => {
  it('maps empty and default API values to default', () => {
    expect(normalizeCampaignSendRateForForm(null)).toBe('default')
    expect(normalizeCampaignSendRateForForm('')).toBe('default')
    expect(normalizeCampaignSendRateForForm('default')).toBe('default')
    expect(normalizeCampaignSendRateForForm('DEFAULT')).toBe('default')
  })

  it('normalizes known rates', () => {
    expect(normalizeCampaignSendRateForForm('2/S')).toBe('2/s')
    expect(normalizeCampaignSendRateForForm('20/m')).toBe('20/m')
  })

  it('keeps unknown saved rates for display', () => {
    expect(normalizeCampaignSendRateForForm('10/m')).toBe('10/m')
  })
})

describe('campaignSendRateOptionsForForm', () => {
  it('returns only preset options for known values', () => {
    expect(campaignSendRateOptionsForForm('default')).toHaveLength(6)
    expect(campaignSendRateOptionsForForm('5/m')).toHaveLength(6)
  })

  it('appends saved custom rate when not in presets', () => {
    const options = campaignSendRateOptionsForForm('10/m')
    expect(options).toHaveLength(7)
    expect(options[6]).toEqual({ value: '10/m', label: 'Taxa salva (10/m)' })
  })
})

describe('campaignSendRatePayloadValue', () => {
  it('sends default token for empty or default selection', () => {
    expect(campaignSendRatePayloadValue('default')).toBe('default')
    expect(campaignSendRatePayloadValue('')).toBe('default')
  })

  it('sends lowercase rate strings', () => {
    expect(campaignSendRatePayloadValue('1/S')).toBe('1/s')
    expect(campaignSendRatePayloadValue('60/m')).toBe('60/m')
  })
})

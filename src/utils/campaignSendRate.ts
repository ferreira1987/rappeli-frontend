import {
  CAMPAIGN_SEND_RATE_OPTIONS,
  type CampaignSendRateOption,
  type CampaignSendRateOptionValue,
} from '@/constants/campaignSendRates'

const KNOWN_VALUES = new Set<string>(CAMPAIGN_SEND_RATE_OPTIONS.map((option) => option.value))

export function normalizeCampaignSendRateForForm(
  apiValue: string | null | undefined,
): CampaignSendRateOptionValue | string {
  if (apiValue == null || apiValue.trim() === '') {
    return 'default'
  }

  const normalized = apiValue.trim().toLowerCase()
  if (normalized === 'default') {
    return 'default'
  }

  if (KNOWN_VALUES.has(normalized)) {
    return normalized as CampaignSendRateOptionValue
  }

  return normalized
}

export function campaignSendRateOptionsForForm(
  selected: string,
): CampaignSendRateOption[] | Array<CampaignSendRateOption | { value: string; label: string }> {
  const normalized = selected.trim().toLowerCase()
  if (normalized === 'default' || KNOWN_VALUES.has(normalized)) {
    return CAMPAIGN_SEND_RATE_OPTIONS
  }

  return [
    ...CAMPAIGN_SEND_RATE_OPTIONS,
    { value: normalized, label: `Taxa salva (${normalized})` },
  ]
}

export function campaignSendRatePayloadValue(formValue: string): string {
  const trimmed = formValue.trim()
  if (!trimmed || trimmed.toLowerCase() === 'default') {
    return 'default'
  }

  return trimmed.toLowerCase()
}

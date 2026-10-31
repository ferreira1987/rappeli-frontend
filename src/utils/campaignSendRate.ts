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

export function campaignSendRateMessagesPerMinute(formValue: string): number {
  const normalized = formValue.trim().toLowerCase()
  if (normalized === '1/s') return 60
  if (normalized === '2/s') return 120
  if (normalized === '5/m') return 5
  if (normalized === '20/m') return 20
  if (normalized === '60/m') return 60
  return 5
}

export function estimateCampaignSendDurationMinutes(
  recipientCount: number,
  formSendRate: string,
): number | null {
  if (!Number.isFinite(recipientCount) || recipientCount <= 0) {
    return null
  }
  const perMinute = campaignSendRateMessagesPerMinute(formSendRate)
  if (perMinute <= 0) return null
  return Math.max(1, Math.ceil(recipientCount / perMinute))
}

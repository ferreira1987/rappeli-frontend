import { describe, expect, it } from 'vitest'

import {
  formatMessagesWebhookLabel,
  formatQualityRatingDisplay,
  hasWhatsAppDisplayText,
  maskWhatsAppIdentifier,
} from '@/utils/whatsapp'

describe('maskWhatsAppIdentifier', () => {
  it('returns em dash for empty values', () => {
    expect(maskWhatsAppIdentifier(null)).toBe('—')
    expect(maskWhatsAppIdentifier('   ')).toBe('—')
  })

  it('masks long identifiers', () => {
    expect(maskWhatsAppIdentifier('109847293847123456')).toBe('109847293847***')
  })

  it('masks short identifiers without slicing', () => {
    expect(maskWhatsAppIdentifier('12345')).toBe('12345***')
  })
})

describe('hasWhatsAppDisplayText', () => {
  it('detects non-empty trimmed strings', () => {
    expect(hasWhatsAppDisplayText('ok')).toBe(true)
    expect(hasWhatsAppDisplayText('  ')).toBe(false)
    expect(hasWhatsAppDisplayText(null)).toBe(false)
  })
})

describe('formatMessagesWebhookLabel', () => {
  it('combines status and latency when present', () => {
    expect(
      formatMessagesWebhookLabel({
        messages_webhook_status: 'Ativo e sincronizado',
        messages_webhook_latency_ms: 120,
      }),
    ).toBe('Ativo e sincronizado (latência 120ms)')
  })
})

describe('formatQualityRatingDisplay', () => {
  it('maps Meta quality tiers', () => {
    expect(formatQualityRatingDisplay('GREEN')).toEqual({
      label: 'Alta (Verde)',
      tone: 'green',
    })
    expect(formatQualityRatingDisplay('yellow')).toEqual({
      label: 'Média (Amarelo)',
      tone: 'yellow',
    })
  })
})

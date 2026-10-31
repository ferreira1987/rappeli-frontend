import { describe, expect, it } from 'vitest'

import {
  formatQualityRatingDisplay,
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

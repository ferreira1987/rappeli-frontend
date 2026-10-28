import { describe, expect, it } from 'vitest'

import {
  extractPhoneDigits,
  formatBrazilPhone,
  normalizeBrazilPhoneDigits,
  validateBrazilPhoneField,
} from '@/utils/phone'

describe('formatBrazilPhone', () => {
  it('formats mobile with country code', () => {
    expect(formatBrazilPhone('5562982431951')).toBe('+55 62 98243-1951')
  })

  it('formats landline with country code', () => {
    expect(formatBrazilPhone('556282431951')).toBe('+55 62 8243-1951')
  })

  it('returns empty for blank input', () => {
    expect(formatBrazilPhone('')).toBe('')
    expect(formatBrazilPhone(null)).toBe('')
  })
})

describe('validateBrazilPhoneField', () => {
  it('rejects non-numeric input with Telefone inválido', () => {
    const result = validateBrazilPhoneField('abc')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Telefone inválido.')
    }
  })

  it('requires phone when empty', () => {
    const result = validateBrazilPhoneField('')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Informe o telefone.')
    }
  })

  it('accepts national mobile and normalizes with country code', () => {
    const result = validateBrazilPhoneField('(11) 99988-7766')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(extractPhoneDigits(result.normalized)).toBe('5511999887766')
    }
  })

  it('accepts E.164 already prefixed', () => {
    const result = validateBrazilPhoneField('5511999887766')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.normalized).toBe('5511999887766')
    }
  })

  it('rejects too few digits after stripping', () => {
    const result = validateBrazilPhoneField('12345')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Telefone inválido.')
    }
  })
})

describe('normalizeBrazilPhoneDigits', () => {
  it('prefixes 55 when missing', () => {
    expect(normalizeBrazilPhoneDigits('11999887766')).toBe('5511999887766')
  })
})

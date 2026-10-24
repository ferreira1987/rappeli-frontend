import { describe, expect, it } from 'vitest'

import { formatBrazilPhone } from '@/utils/phone'

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

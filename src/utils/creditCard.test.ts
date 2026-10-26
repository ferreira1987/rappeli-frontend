import { describe, expect, it } from 'vitest'

import { detectCardBrand, maskCardNumber, normalizeCardNumber } from '@/utils/creditCard'

describe('creditCard', () => {
  it('detects visa and mastercard', () => {
    expect(detectCardBrand('4111111111111111')).toBe('visa')
    expect(detectCardBrand('5555555555554444')).toBe('mastercard')
  })

  it('masks card number in groups of four', () => {
    expect(maskCardNumber('4111111111111111')).toBe('4111 1111 1111 1111')
    expect(normalizeCardNumber(maskCardNumber('4111 1111'))).toBe('41111111')
  })
})

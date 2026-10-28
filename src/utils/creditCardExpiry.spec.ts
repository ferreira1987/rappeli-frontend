import { describe, expect, it } from 'vitest'

import {
  formatStoredCardExpiry,
  isCreditCardExpiryExpired,
  isValidCardExpiryMonth,
  parseCardExpiryDigits,
} from '@/utils/creditCardExpiry'

describe('parseCardExpiryDigits', () => {
  it('formats progressive MM/AA input without truncating the year', () => {
    expect(parseCardExpiryDigits('0')).toEqual({
      display: '0',
      expiryMonth: '0',
      expiryYear: '',
    })
    expect(parseCardExpiryDigits('05')).toEqual({
      display: '05',
      expiryMonth: '05',
      expiryYear: '',
    })
    expect(parseCardExpiryDigits('053')).toEqual({
      display: '05/3',
      expiryMonth: '05',
      expiryYear: '',
    })
    expect(parseCardExpiryDigits('0530')).toEqual({
      display: '05/30',
      expiryMonth: '05',
      expiryYear: '2030',
    })
    expect(parseCardExpiryDigits('05/30')).toEqual({
      display: '05/30',
      expiryMonth: '05',
      expiryYear: '2030',
    })
    expect(parseCardExpiryDigits('0529')).toEqual({
      display: '05/29',
      expiryMonth: '05',
      expiryYear: '2029',
    })
  })

  it('caps at four digits', () => {
    expect(parseCardExpiryDigits('053012')).toEqual({
      display: '05/30',
      expiryMonth: '05',
      expiryYear: '2030',
    })
  })
})

describe('formatStoredCardExpiry', () => {
  it('shows partial month while year is empty', () => {
    expect(formatStoredCardExpiry('05', '')).toBe('05')
  })

  it('shows MM/AA when year is complete', () => {
    expect(formatStoredCardExpiry('05', '2030')).toBe('05/30')
  })
})

describe('isValidCardExpiryMonth', () => {
  it('accepts 01-12 only when two digits', () => {
    expect(isValidCardExpiryMonth('01')).toBe(true)
    expect(isValidCardExpiryMonth('12')).toBe(true)
    expect(isValidCardExpiryMonth('00')).toBe(false)
    expect(isValidCardExpiryMonth('13')).toBe(false)
    expect(isValidCardExpiryMonth('5')).toBe(false)
  })
})

describe('isCreditCardExpiryExpired', () => {
  it('detects expiry after the last day of the month', () => {
    const reference = new Date(2030, 4, 15)
    expect(isCreditCardExpiryExpired('04', '2030', reference)).toBe(true)
    expect(isCreditCardExpiryExpired('05', '2030', reference)).toBe(false)
  })
})

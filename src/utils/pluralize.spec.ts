import { describe, expect, it } from 'vitest'

import { pluralWordPt, pluralizePt } from '@/utils/pluralize'

describe('pluralizePt', () => {
  it('uses singular form for count 1', () => {
    expect(pluralizePt(1, 'campanha')).toBe('1 campanha')
    expect(pluralWordPt(1, 'membro')).toBe('membro')
  })

  it('uses plural form for other counts', () => {
    expect(pluralizePt(2, 'campanha')).toBe('2 campanhas')
    expect(pluralWordPt(0, 'membro')).toBe('membros')
  })
})

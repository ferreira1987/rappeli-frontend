import { describe, expect, it } from 'vitest'

import { isValidBrazilianDocument, maskCpfCnpj, normalizeDocument } from '@/utils/brazilianDocument'

describe('brazilianDocument', () => {
  it('validates CPF used in backend tests', () => {
    expect(isValidBrazilianDocument('52998224725')).toBe(true)
    expect(isValidBrazilianDocument('529.982.247-25')).toBe(true)
  })

  it('rejects invalid CPF', () => {
    expect(isValidBrazilianDocument('11111111111')).toBe(false)
    expect(isValidBrazilianDocument('123')).toBe(false)
  })

  it('masks CPF and CNPJ progressively', () => {
    expect(maskCpfCnpj('52998224725')).toBe('529.982.247-25')
    expect(normalizeDocument(maskCpfCnpj('52998224725'))).toBe('52998224725')
  })
})

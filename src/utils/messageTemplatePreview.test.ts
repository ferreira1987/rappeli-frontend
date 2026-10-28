import { describe, expect, it } from 'vitest'

import {
  applyTemplateBodyParameters,
  extractTemplateVariableIndexes,
  isMessageTemplateApproved,
  resolveTemplateVariableIndexes,
} from '@/utils/messageTemplatePreview'

describe('messageTemplatePreview', () => {
  it('extracts variable indexes from body text', () => {
    expect(extractTemplateVariableIndexes('Olá {{1}}, código {{2}}.')).toEqual([1, 2])
  })

  it('prefers API variable list when present', () => {
    expect(resolveTemplateVariableIndexes([2, 1], 'ignored')).toEqual([1, 2])
  })

  it('applies parameters to numbered placeholders', () => {
    const body = 'Olá {{1}}, seu código é {{2}}.'
    expect(applyTemplateBodyParameters(body, ['Mariana', 'ABC'])).toBe(
      'Olá Mariana, seu código é ABC.',
    )
  })

  it('keeps placeholder when parameter is empty', () => {
    expect(applyTemplateBodyParameters('Oi {{1}}', [''])).toBe('Oi {{1}}')
  })

  it('detects approved templates by flag or status', () => {
    expect(isMessageTemplateApproved({ approved: false, status: 'APPROVED' })).toBe(true)
    expect(isMessageTemplateApproved({ approved: true, status: 'PENDING' })).toBe(true)
    expect(isMessageTemplateApproved({ approved: false, status: 'PENDING' })).toBe(false)
  })
})

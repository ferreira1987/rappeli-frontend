import { describe, expect, it } from 'vitest'

import {
  messageTemplateCategoryLabel,
  messageTemplateStatusLabel,
} from '@/utils/messageTemplateLabels'

describe('messageTemplateLabels', () => {
  it('maps status codes to Portuguese labels', () => {
    expect(messageTemplateStatusLabel('APPROVED')).toBe('Aprovado')
    expect(messageTemplateStatusLabel('PENDING')).toBe('Pendente')
    expect(messageTemplateStatusLabel('REJECTED')).toBe('Rejeitado')
  })

  it('maps category codes to readable labels', () => {
    expect(messageTemplateCategoryLabel('MARKETING')).toBe('Marketing')
    expect(messageTemplateCategoryLabel('UTILITY')).toBe('Utilidade')
  })
})

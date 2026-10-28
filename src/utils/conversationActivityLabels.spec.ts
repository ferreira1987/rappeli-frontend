import { describe, expect, it } from 'vitest'

import { formatConversationActivityLabel } from '@/utils/conversationActivityLabels'

describe('formatConversationActivityLabel', () => {
  it('prioriza label da API', () => {
    expect(formatConversationActivityLabel('transfer', 'Transferida pela equipe')).toBe(
      'Transferida pela equipe',
    )
  })

  it('traduz tipos conhecidos em inglês', () => {
    expect(formatConversationActivityLabel('transfer')).toBe('Transferida')
    expect(formatConversationActivityLabel('resolve')).toBe('Resolvida')
  })

  it('preserva rótulo já legível da API', () => {
    expect(formatConversationActivityLabel('Conversa reaberta')).toBe('Conversa reaberta')
  })
})

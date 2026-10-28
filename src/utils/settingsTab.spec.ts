import { describe, expect, it } from 'vitest'

import { settingsTabFromQuery } from '@/utils/settingsTab'

describe('settingsTabFromQuery', () => {
  it('maps empresa query variants to empresa tab', () => {
    expect(settingsTabFromQuery('empresa')).toBe('empresa')
    expect(settingsTabFromQuery('Empresa')).toBe('empresa')
    expect(settingsTabFromQuery(undefined)).toBe('empresa')
  })

  it('maps other tabs', () => {
    expect(settingsTabFromQuery('equipe')).toBe('equipe')
    expect(settingsTabFromQuery('plano')).toBe('plano')
    expect(settingsTabFromQuery('whatsapp')).toBe('whatsapp')
  })
})

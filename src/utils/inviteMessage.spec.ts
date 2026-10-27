import { describe, expect, it } from 'vitest'

import { inviteInvalidDisplayMessage } from '@/utils/inviteMessage'

describe('inviteInvalidDisplayMessage', () => {
  it('returns fallback for generic server messages', () => {
    expect(inviteInvalidDisplayMessage('Server Error')).toBe('Convite inválido ou expirado')
  })

  it('keeps specific backend messages', () => {
    expect(inviteInvalidDisplayMessage('Este convite expirou.')).toBe('Este convite expirou.')
  })
})

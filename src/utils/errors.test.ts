import { describe, expect, it } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'

import { getApiErrorCode } from '@/utils/errors'

describe('getApiErrorCode', () => {
  it('returns API code from axios 422 responses', () => {
    const error = new AxiosError(
      'Unprocessable',
      '422',
      undefined,
      undefined,
      {
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {
          message: 'WhatsApp Business (Meta) não está configurado para esta empresa. Conecte a conta em Configurações.',
          code: 'whatsapp_meta_not_configured',
        },
      },
    )

    expect(getApiErrorCode(error)).toBe('whatsapp_meta_not_configured')
  })
})

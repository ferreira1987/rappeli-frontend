import axios from 'axios'
import { describe, expect, it } from 'vitest'

import {
  resolveCheckoutSubmitError,
  shouldClearCardAfterCheckoutSubmit,
} from '@/utils/billingCheckoutSubmitError'

describe('resolveCheckoutSubmitError', () => {
  it('returns API message for failed payment', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 402,
        data: { message: 'Cartão recusado pela operadora.' },
        statusText: 'Payment Required',
        headers: {},
        config: {} as never,
      },
    )

    expect(resolveCheckoutSubmitError(error)).toEqual({
      kind: 'message',
      message: 'Cartão recusado pela operadora.',
    })
  })

  it('maps validation errors from 422 responses', () => {
    const error = new axios.AxiosError(
      'Unprocessable',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 422,
        data: { errors: { 'credit_card.number': ['Número inválido.'] } },
        statusText: 'Unprocessable Entity',
        headers: {},
        config: {} as never,
      },
    )

    expect(resolveCheckoutSubmitError(error)).toEqual({
      kind: 'validation',
      fieldErrors: { 'credit_card.number': 'Número inválido.' },
    })
  })

  it('surfaces payment errors in the alert when no form field matches', () => {
    const error = new axios.AxiosError(
      'Unprocessable',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 422,
        data: { errors: { payment: ['Cartão recusado pela operadora.'] } },
        statusText: 'Unprocessable Entity',
        headers: {},
        config: {} as never,
      },
    )

    expect(resolveCheckoutSubmitError(error)).toEqual({
      kind: 'message',
      message: 'Cartão recusado pela operadora.',
    })
  })

  it('keeps field errors and alert for mixed validation payloads', () => {
    const error = new axios.AxiosError(
      'Unprocessable',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 422,
        data: {
          errors: {
            'holder.email': ['Informe um e-mail válido.'],
            payment: ['Não foi possível processar o pagamento.'],
          },
        },
        statusText: 'Unprocessable Entity',
        headers: {},
        config: {} as never,
      },
    )

    expect(resolveCheckoutSubmitError(error)).toEqual({
      kind: 'validation',
      fieldErrors: { 'holder.email': 'Informe um e-mail válido.' },
      alertMessage: 'Não foi possível processar o pagamento.',
    })
  })
})

describe('shouldClearCardAfterCheckoutSubmit', () => {
  it('clears card fields only after success', () => {
    expect(shouldClearCardAfterCheckoutSubmit(true)).toBe(true)
    expect(shouldClearCardAfterCheckoutSubmit(false)).toBe(false)
  })
})

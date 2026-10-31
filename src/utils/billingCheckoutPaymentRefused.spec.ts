import { describe, expect, it } from 'vitest'

import {
  CHECKOUT_PAYMENT_REFUSED_HINT,
  isCheckoutPaymentFailureResult,
} from '@/utils/billingCheckoutPaymentRefused'

describe('isCheckoutPaymentFailureResult', () => {
  it('returns true for API message failures', () => {
    expect(
      isCheckoutPaymentFailureResult({ kind: 'message', message: 'Cartão recusado pela operadora.' }),
    ).toBe(true)
  })

  it('returns true when validation includes a payment alert', () => {
    expect(
      isCheckoutPaymentFailureResult({
        kind: 'validation',
        fieldErrors: { 'holder.email': 'Informe um e-mail válido.' },
        alertMessage: 'Não foi possível processar o pagamento.',
      }),
    ).toBe(true)
  })

  it('returns false for field-only validation', () => {
    expect(
      isCheckoutPaymentFailureResult({
        kind: 'validation',
        fieldErrors: { 'credit_card.number': 'Número inválido.' },
      }),
    ).toBe(false)
  })
})

describe('CHECKOUT_PAYMENT_REFUSED_HINT', () => {
  it('is defined for the refused-state banner', () => {
    expect(CHECKOUT_PAYMENT_REFUSED_HINT.length).toBeGreaterThan(0)
  })
})

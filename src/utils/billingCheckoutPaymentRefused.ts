import type { CheckoutSubmitErrorResult } from '@/utils/billingCheckoutSubmitError'

/** Indica falha de pagamento na API (ex.: cartão recusado), não erro local de formulário. */
export function isCheckoutPaymentFailureResult(
  resolved: CheckoutSubmitErrorResult,
): boolean {
  if (resolved.kind === 'message') {
    return true
  }
  if (resolved.kind === 'validation' && resolved.alertMessage) {
    return true
  }
  return false
}

export const CHECKOUT_PAYMENT_REFUSED_HINT =
  'Tente outro cartão ou contate seu banco.'

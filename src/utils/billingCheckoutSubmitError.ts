import { getErrorMessage, getValidationErrors } from '@/utils/errors'

/** Campos exibidos no checkout (faturamento + cartão). */
export const CHECKOUT_FORM_FIELD_KEYS = new Set([
  'holder.name',
  'holder.cpf_cnpj',
  'holder.email',
  'holder.phone',
  'holder.postal_code',
  'holder.address_number',
  'credit_card.holder_name',
  'credit_card.number',
  'credit_card.expiry_month',
  'credit_card.expiry_year',
  'credit_card.cvv',
])

export type CheckoutSubmitErrorResult =
  | { kind: 'validation'; fieldErrors: Record<string, string>; alertMessage?: string }
  | { kind: 'message'; message: string }

export function resolveCheckoutSubmitError(error: unknown): CheckoutSubmitErrorResult {
  const validation = getValidationErrors(error)
  if (validation) {
    const fieldErrors: Record<string, string> = {}
    const alertMessages: string[] = []

    for (const [field, message] of Object.entries(validation)) {
      if (CHECKOUT_FORM_FIELD_KEYS.has(field)) {
        fieldErrors[field] = message
      } else {
        alertMessages.push(message)
      }
    }

    const alertMessage =
      alertMessages.length > 0 ? alertMessages.join(' ') : undefined

    if (Object.keys(fieldErrors).length === 0 && alertMessage) {
      return { kind: 'message', message: alertMessage }
    }

    return { kind: 'validation', fieldErrors, alertMessage }
  }

  return { kind: 'message', message: getErrorMessage(error) }
}

export function shouldClearCardAfterCheckoutSubmit(success: boolean): boolean {
  return success
}

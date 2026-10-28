import { getErrorMessage, getValidationErrors } from '@/utils/errors'

export type CheckoutSubmitErrorResult =
  | { kind: 'validation'; fieldErrors: Record<string, string> }
  | { kind: 'message'; message: string }

export function resolveCheckoutSubmitError(error: unknown): CheckoutSubmitErrorResult {
  const validation = getValidationErrors(error)
  if (validation) {
    return { kind: 'validation', fieldErrors: validation }
  }
  return { kind: 'message', message: getErrorMessage(error) }
}

export function shouldClearCardAfterCheckoutSubmit(success: boolean): boolean {
  return success
}

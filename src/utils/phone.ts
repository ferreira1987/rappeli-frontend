/** Formata telefones brasileiros para exibição (E.164 sem espaços na entrada). */
export function formatBrazilPhone(raw: string | null | undefined): string {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (!digits) {
    return ''
  }

  let country = ''
  let national = digits

  if (digits.startsWith('55') && digits.length >= 12) {
    country = '+55'
    national = digits.slice(2)
  }

  if (national.length < 10) {
    return country ? `${country} ${national}` : national
  }

  const ddd = national.slice(0, 2)
  const subscriber = national.slice(2)

  if (subscriber.length === 9) {
    const formatted = `${subscriber.slice(0, 5)}-${subscriber.slice(5)}`
    return country ? `${country} ${ddd} ${formatted}` : `(${ddd}) ${formatted}`
  }

  if (subscriber.length === 8) {
    const formatted = `${subscriber.slice(0, 4)}-${subscriber.slice(4)}`
    return country ? `${country} ${ddd} ${formatted}` : `(${ddd}) ${formatted}`
  }

  const fallback = national
  return country ? `${country} ${fallback}` : fallback
}

export const BRAZIL_PHONE_DIGITS_MIN = 10
export const BRAZIL_PHONE_DIGITS_MAX = 13

export function extractPhoneDigits(raw: string): string {
  return raw.replace(/\D/g, '')
}

/** Normaliza para E.164 BR (somente dígitos), alinhado ao backend `BrazilPhoneNumber::normalize`. */
export function normalizeBrazilPhoneDigits(digits: string): string {
  if (!digits) {
    return ''
  }
  return digits.startsWith('55') ? digits : `55${digits}`
}

export function isValidBrazilPhoneDigitCount(digits: string): boolean {
  const length = digits.length
  if (length < BRAZIL_PHONE_DIGITS_MIN || length > BRAZIL_PHONE_DIGITS_MAX) {
    return false
  }
  if (length >= 12) {
    return digits.startsWith('55')
  }
  return length === 10 || length === 11
}

export type BrazilPhoneFieldValidation =
  | { ok: true; digits: string; normalized: string }
  | { ok: false; error: string; field: 'phone' }

/**
 * Valida telefone BR antes do envio à API.
 * - Campo vazio → "Informe o telefone." (se required)
 * - Texto sem dígitos (ex.: "abc") → "Telefone inválido." (não envia string vazia)
 */
export function validateBrazilPhoneField(
  raw: string,
  options: { required?: boolean } = {},
): BrazilPhoneFieldValidation {
  const required = options.required ?? true
  const trimmed = raw.trim()
  const digits = extractPhoneDigits(raw)

  if (!trimmed) {
    if (required) {
      return { ok: false, error: 'Informe o telefone.', field: 'phone' }
    }
    return { ok: true, digits: '', normalized: '' }
  }

  if (!digits) {
    return { ok: false, error: 'Telefone inválido.', field: 'phone' }
  }

  if (!isValidBrazilPhoneDigitCount(digits)) {
    return { ok: false, error: 'Telefone inválido.', field: 'phone' }
  }

  const normalized = normalizeBrazilPhoneDigits(digits)
  if (normalized.length < 12 || normalized.length > 13) {
    return { ok: false, error: 'Telefone inválido.', field: 'phone' }
  }

  return { ok: true, digits, normalized }
}

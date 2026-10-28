export type ParsedCardExpiry = {
  display: string
  expiryMonth: string
  expiryYear: string
}

/** Máscara MM/AA a partir de até 4 dígitos (ordem preservada, sem reordenar). */
export function parseCardExpiryDigits(digits: string): ParsedCardExpiry {
  const raw = digits.replace(/\D/g, '').slice(0, 4)
  const expiryMonth = raw.slice(0, 2)
  const yearDigits = raw.slice(2, 4)
  const expiryYear = yearDigits.length === 2 ? `20${yearDigits}` : ''

  let display = expiryMonth
  if (raw.length > 2) {
    display = `${expiryMonth}/${yearDigits}`
  }

  return { display, expiryMonth, expiryYear }
}

/** Formata validade já persistida no formulário (mês + ano com 4 dígitos). */
export function formatStoredCardExpiry(expiryMonth: string, expiryYear: string): string {
  if (!expiryMonth && !expiryYear) {
    return ''
  }
  if (!expiryYear) {
    return expiryMonth
  }
  const yy = expiryYear.slice(-2)
  return `${expiryMonth}/${yy}`
}

export function isValidCardExpiryMonth(expiryMonth: string): boolean {
  if (expiryMonth.length !== 2) {
    return false
  }
  const month = Number(expiryMonth)
  return month >= 1 && month <= 12
}

/** Verdadeiro se mês/ano completos e anteriores ao fim do mês de validade. */
export function isCreditCardExpiryExpired(
  expiryMonth: string,
  expiryYear: string,
  reference: Date = new Date(),
): boolean {
  if (!isValidCardExpiryMonth(expiryMonth) || expiryYear.length !== 4) {
    return false
  }
  const month = Number(expiryMonth)
  const year = Number(expiryYear)
  const endOfExpiryMonth = new Date(year, month, 0, 23, 59, 59, 999)
  return reference > endOfExpiryMonth
}

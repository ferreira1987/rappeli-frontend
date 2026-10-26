export type CardBrand =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'elo'
  | 'hipercard'
  | 'diners'
  | 'discover'
  | 'unknown'

export function normalizeCardNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 19)
}

export function maskCardNumber(value: string): string {
  const digits = normalizeCardNumber(value)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export function detectCardBrand(number: string): CardBrand {
  const digits = normalizeCardNumber(number)

  if (/^4\d{0,15}$/.test(digits)) {
    return 'visa'
  }
  if (/^(5[1-5]|2[2-7])\d{0,14}$/.test(digits)) {
    return 'mastercard'
  }
  if (/^3[47]\d{0,13}$/.test(digits)) {
    return 'amex'
  }
  if (/^(636368|636369|438935|504175|451416|636297|5067|4576|4011)/.test(digits)) {
    return 'elo'
  }
  if (/^(606282|3841)/.test(digits)) {
    return 'hipercard'
  }
  if (/^3(?:0[0-5]|[68])\d{0,11}$/.test(digits)) {
    return 'diners'
  }
  if (/^6(?:011|5)/.test(digits)) {
    return 'discover'
  }

  return digits.length >= 2 ? 'unknown' : 'unknown'
}

export function cardBrandLabel(brand: CardBrand): string {
  switch (brand) {
    case 'visa':
      return 'Visa'
    case 'mastercard':
      return 'Mastercard'
    case 'amex':
      return 'American Express'
    case 'elo':
      return 'Elo'
    case 'hipercard':
      return 'Hipercard'
    case 'diners':
      return 'Diners'
    case 'discover':
      return 'Discover'
    default:
      return 'Cartão'
  }
}

export function cvvMaxLength(brand: CardBrand): number {
  return brand === 'amex' ? 4 : 3
}

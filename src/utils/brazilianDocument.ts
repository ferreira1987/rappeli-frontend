export function normalizeDocument(document: string): string {
  return document.replace(/\D/g, '')
}

export function isValidBrazilianDocument(document: string): boolean {
  const digits = normalizeDocument(document)

  if (digits.length === 11) {
    return isValidCpf(digits)
  }

  if (digits.length === 14) {
    return isValidCnpj(digits)
  }

  return false
}

function isValidCpf(cpf: string): boolean {
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  for (let t = 9; t < 11; t++) {
    let sum = 0
    for (let i = 0; i < t; i++) {
      sum += Number(cpf[i]) * (t + 1 - i)
    }
    const digit = (10 * sum) % 11 % 10
    if (Number(cpf[t]) !== digit) {
      return false
    }
  }

  return true
}

function isValidCnpj(cnpj: string): boolean {
  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false
  }

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += Number(cnpj[i]) * (weights1[i] ?? 0)
  }
  const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (Number(cnpj[12]) !== digit1) {
    return false
  }

  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += Number(cnpj[i]) * (weights2[i] ?? 0)
  }
  const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11)

  return Number(cnpj[13]) === digit2
}

export function maskCpfCnpj(value: string): string {
  const digits = normalizeDocument(value).slice(0, 14)

  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

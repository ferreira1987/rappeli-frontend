import type { CheckoutCreditCardPayload, CheckoutHolderPayload } from '@/types/billing'
import { isValidBrazilianDocument } from '@/utils/brazilianDocument'
import { normalizeCardNumber } from '@/utils/creditCard'

export function emptyCheckoutForms(): {
  holder: CheckoutHolderPayload
  creditCard: CheckoutCreditCardPayload
} {
  return {
    holder: {
      name: '',
      cpf_cnpj: '',
      email: '',
      phone: '',
      postal_code: '',
      address_number: '',
    },
    creditCard: {
      holder_name: '',
      number: '',
      expiry_month: '',
      expiry_year: '',
      cvv: '',
    },
  }
}

export function validateCheckoutForms(
  holder: CheckoutHolderPayload,
  creditCard: CheckoutCreditCardPayload,
): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!holder.name.trim()) {
    errors['holder.name'] = 'Informe o nome do titular.'
  }

  if (!isValidBrazilianDocument(holder.cpf_cnpj)) {
    errors['holder.cpf_cnpj'] = 'Informe um CPF ou CNPJ válido.'
  }

  if (!holder.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(holder.email)) {
    errors['holder.email'] = 'Informe um e-mail válido.'
  }

  const phoneDigits = holder.phone.replace(/\D/g, '')
  if (phoneDigits.length < 10) {
    errors['holder.phone'] = 'Informe um telefone válido.'
  }

  const cepDigits = holder.postal_code.replace(/\D/g, '')
  if (cepDigits.length !== 8) {
    errors['holder.postal_code'] = 'Informe um CEP válido.'
  }

  if (!holder.address_number.trim()) {
    errors['holder.address_number'] = 'Informe o número do endereço.'
  }

  const cardDigits = normalizeCardNumber(creditCard.number)
  if (cardDigits.length < 13) {
    errors['credit_card.number'] = 'Informe o número do cartão.'
  }

  if (!creditCard.holder_name.trim()) {
    errors['credit_card.holder_name'] = 'Informe o nome impresso no cartão.'
  }

  const month = Number(creditCard.expiry_month)
  if (!creditCard.expiry_month || month < 1 || month > 12) {
    errors['credit_card.expiry_month'] = 'Informe a validade do cartão.'
  }

  if (!creditCard.expiry_year || creditCard.expiry_year.length !== 4) {
    errors['credit_card.expiry_year'] = 'Informe a validade do cartão.'
  }

  const cvvDigits = creditCard.cvv.replace(/\D/g, '')
  if (cvvDigits.length < 3) {
    errors['credit_card.cvv'] = 'Informe o CVV.'
  }

  return errors
}

export function clearSensitiveCheckout(
  holder: CheckoutHolderPayload,
  creditCard: CheckoutCreditCardPayload,
): void {
  holder.cpf_cnpj = ''
  holder.phone = ''
  holder.postal_code = ''
  creditCard.number = ''
  creditCard.cvv = ''
  creditCard.expiry_month = ''
  creditCard.expiry_year = ''
  creditCard.holder_name = ''
}

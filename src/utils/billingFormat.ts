import type { BillingCycle, PaymentStatus, SubscriptionStatus } from '@/types/billing'

export function formatBillingCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

export function billingCycleLabel(cycle: BillingCycle): string {
  return cycle === 'MONTHLY' ? 'Mensal' : 'Anual'
}

export function subscriptionStatusLabel(status: SubscriptionStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Ativa'
    case 'INACTIVE':
      return 'Inativa'
    case 'CANCELED':
      return 'Cancelada'
    case 'EXPIRED':
      return 'Expirada'
    default:
      return status
  }
}

export function paymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Pendente'
    case 'CONFIRMED':
      return 'Confirmado'
    case 'RECEIVED':
      return 'Recebido'
    case 'OVERDUE':
      return 'Em atraso'
    case 'REFUNDED':
      return 'Estornado'
    case 'REFUSED':
      return 'Recusado'
    default:
      return status
  }
}

export function formatBillingDate(isoOrDate: string | null | undefined): string {
  if (!isoOrDate) {
    return '—'
  }
  const date = new Date(isoOrDate.includes('T') ? isoOrDate : `${isoOrDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) {
    return isoOrDate
  }
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date)
}

export function maskPostalCode(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 5) {
    return digits
  }
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function maskPhoneBr(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) {
    return digits
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

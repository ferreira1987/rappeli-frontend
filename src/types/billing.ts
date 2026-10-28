export type BillingCycle = 'MONTHLY' | 'YEARLY'

export type BillingModality = 'meta_direct' | 'included'

export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELED' | 'EXPIRED'

export type PaymentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'RECEIVED'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'REFUSED'

export type BillingPlanItem = {
  id: string
  tier: string
  name: string
  cycle: BillingCycle
  amount: number
  included_messages_per_month?: number | null
  agents_limit?: number | null
  marketing_billed_separately?: boolean
  overage_price_per_message?: number | null
}

export type BillingModeCatalog = {
  label: string
  plans: BillingPlanItem[]
}

export type BillingPlansResponse = {
  modes: Record<BillingModality, BillingModeCatalog>
  shared_benefits: string[]
  free_trial: boolean
  setup_fee: boolean
  overage_price_per_message?: number | null
  marketing_billed_separately?: boolean
  agents_limit?: number | null
}

export type SubscriptionPaymentMethod = {
  brand: string | null
  last_digits: string | null
}

export type Subscription = {
  id: number
  plan: string
  plan_name: string
  modality: BillingModality
  modality_label: string
  tier: string
  cycle: BillingCycle
  status: SubscriptionStatus
  value: number
  next_due_date: string | null
  payment_method: SubscriptionPaymentMethod
  cancelled_at: string | null
}

export type SubscriptionResponse =
  | Subscription
  | {
      subscription: null
    }

export type BillingPayment = {
  id: number
  asaas_payment_id: string
  status: PaymentStatus
  value: number
  due_date: string | null
  paid_at: string | null
  billing_type: string
}

export type CheckoutHolderPayload = {
  name: string
  cpf_cnpj: string
  email: string
  phone: string
  postal_code: string
  address_number: string
}

export type CheckoutCreditCardPayload = {
  holder_name: string
  number: string
  expiry_month: string
  expiry_year: string
  cvv: string
}

export type CheckoutPayload = {
  modality: BillingModality
  tier: string
  cycle: BillingCycle
  holder: CheckoutHolderPayload
  credit_card: CheckoutCreditCardPayload
}

export type ChangePlanPayload =
  | { plan: string }
  | {
      modality: BillingModality
      tier: string
      cycle: BillingCycle
    }

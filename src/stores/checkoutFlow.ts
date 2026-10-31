import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import type { BillingCycle, BillingModality } from '@/types/billing'

const STORAGE_KEY = 'rappeli.checkout-flow.v1'

type Persisted = {
  modality: BillingModality
  tier: string
  cycle: BillingCycle
  planId: string
  planName: string
  amount: number
  modalityLabel: string
  whatsapp: string
  companyName: string
}

function loadPersisted(): Partial<Persisted> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }
    return JSON.parse(raw) as Partial<Persisted>
  } catch {
    return {}
  }
}

export const useCheckoutFlowStore = defineStore('checkoutFlow', () => {
  const saved = loadPersisted()

  const modality = ref<BillingModality>(saved.modality ?? 'included')
  const tier = ref<string>(saved.tier ?? 'profissional')
  const cycle = ref<BillingCycle>(saved.cycle ?? 'YEARLY')
  const planId = ref(saved.planId ?? '')
  const planName = ref(saved.planName ?? '')
  const amount = ref(saved.amount ?? 0)
  const modalityLabel = ref(saved.modalityLabel ?? 'Mensagens incluídas')
  const whatsapp = ref(saved.whatsapp ?? '')
  const companyName = ref(saved.companyName ?? '')

  function persist(): void {
    const payload: Persisted = {
      modality: modality.value,
      tier: tier.value,
      cycle: cycle.value,
      planId: planId.value,
      planName: planName.value,
      amount: amount.value,
      modalityLabel: modalityLabel.value,
      whatsapp: whatsapp.value,
      companyName: companyName.value,
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  watch([modality, tier, cycle, planId, planName, amount, modalityLabel, whatsapp, companyName], persist, {
    deep: true,
  })

  function setPlanSelection(input: {
    modality: BillingModality
    tier: string
    cycle: BillingCycle
    planId: string
    planName: string
    amount: number
    modalityLabel: string
  }): void {
    modality.value = input.modality
    tier.value = input.tier
    cycle.value = input.cycle
    planId.value = input.planId
    planName.value = input.planName
    amount.value = input.amount
    modalityLabel.value = input.modalityLabel
    persist()
  }

  function setRegistrationExtras(input: { whatsapp?: string; companyName?: string }): void {
    if (input.whatsapp != null) {
      whatsapp.value = input.whatsapp
    }
    if (input.companyName != null) {
      companyName.value = input.companyName
    }
    persist()
  }

  function clearCheckoutPlan(): void {
    planId.value = ''
    planName.value = ''
    amount.value = 0
    modalityLabel.value = ''
    persist()
  }

  return {
    modality,
    tier,
    cycle,
    planId,
    planName,
    amount,
    modalityLabel,
    whatsapp,
    companyName,
    setPlanSelection,
    setRegistrationExtras,
    clearCheckoutPlan,
    persist,
  }
})

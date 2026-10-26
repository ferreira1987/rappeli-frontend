import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBillingNoticeStore = defineStore('billingNotice', () => {
  const blockedMessage = ref<string | null>(null)

  function showBlocked(message?: string): void {
    blockedMessage.value =
      message ??
      'Seu acesso ao painel está bloqueado por pendência de pagamento. Regularize a assinatura para continuar.'
  }

  function clearBlocked(): void {
    blockedMessage.value = null
  }

  return {
    blockedMessage,
    showBlocked,
    clearBlocked,
  }
})

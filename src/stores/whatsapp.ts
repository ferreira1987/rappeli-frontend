import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { fetchWhatsAppAccount } from '@/api/whatsapp'
import type { WhatsAppAccount } from '@/types/whatsapp'
import { getErrorMessage } from '@/utils/errors'

export const useWhatsAppStore = defineStore('whatsapp', () => {
  const account = ref<WhatsAppAccount | null>(null)
  const loading = ref(false)
  const loadError = ref<string | null>(null)
  const hydrated = ref(false)

  const connected = computed(() => account.value?.connected === true)
  const displayPhoneNumber = computed(() => account.value?.display_phone_number ?? null)

  async function refresh(): Promise<void> {
    loading.value = true
    loadError.value = null
    try {
      account.value = await fetchWhatsAppAccount()
    } catch (error) {
      loadError.value = getErrorMessage(error)
      account.value = null
    } finally {
      loading.value = false
      hydrated.value = true
    }
  }

  function setAccount(next: WhatsAppAccount | null): void {
    account.value = next
    hydrated.value = true
  }

  return {
    account,
    loading,
    loadError,
    hydrated,
    connected,
    displayPhoneNumber,
    refresh,
    setAccount,
  }
})

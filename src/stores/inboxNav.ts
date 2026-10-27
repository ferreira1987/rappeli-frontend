import { defineStore } from 'pinia'
import { ref } from 'vue'

import { fetchInboxConversations } from '@/api/inbox'

/** Contadores do menu lateral (badge de Conversas). */
export const useInboxNavStore = defineStore('inboxNav', () => {
  const unreadCount = ref(0)
  const totalCount = ref(0)

  async function refresh(): Promise<void> {
    try {
      const page = await fetchInboxConversations({ per_page: 1 })
      unreadCount.value = page.counts.unread
      totalCount.value = page.counts.all
    } catch {
      unreadCount.value = 0
      totalCount.value = 0
    }
  }

  return { unreadCount, totalCount, refresh }
})

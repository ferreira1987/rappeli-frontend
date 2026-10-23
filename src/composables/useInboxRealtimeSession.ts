import { watch } from 'vue'

import { disconnectEcho, getEcho } from '@/realtime/echo'
import { isRealtimeConfigured, warnIfReverbNotConfigured } from '@/realtime/config'
import { useAuthStore } from '@/stores/auth'

/**
 * After login, warm up Laravel Echo when the user has a company_id from /api/me.
 * Channel subscriptions stay in useConversationsInbox while on /conversas.
 */
export function useInboxRealtimeSession(): void {
  const auth = useAuthStore()

  watch(
    () => ({
      authed: auth.isAuthenticated,
      companyId: auth.user?.company_id ?? null,
      bootstrapped: auth.bootstrapped,
    }),
    ({ authed, companyId, bootstrapped }) => {
      if (!bootstrapped) {
        return
      }

      warnIfReverbNotConfigured()

      if (!authed || companyId == null) {
        disconnectEcho()
        return
      }

      if (!isRealtimeConfigured()) {
        return
      }

      getEcho()
    },
    { immediate: true },
  )
}

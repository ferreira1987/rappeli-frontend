import axios from 'axios'

import { http } from '@/api/http'
import router from '@/router'
import { useBillingNoticeStore } from '@/stores/billingNotice'

const BILLING_SAFE_PREFIXES = ['/assinatura', '/login', '/cadastro']

function isBillingSafePath(path: string): boolean {
  return BILLING_SAFE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

export function setupHttpInterceptors(): void {
  http.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!axios.isAxiosError(error) || error.response?.status !== 402) {
        return Promise.reject(error)
      }

      const payload = error.response.data as { code?: string; message?: string }
      if (payload?.code !== 'billing_blocked') {
        return Promise.reject(error)
      }

      const notice = useBillingNoticeStore()
      notice.showBlocked(payload.message)

      const path = router.currentRoute.value.path
      if (!isBillingSafePath(path)) {
        void router.push({
          name: 'minha-assinatura',
          query: { bloqueio: '1' },
        })
      }

      return Promise.reject(error)
    },
  )
}

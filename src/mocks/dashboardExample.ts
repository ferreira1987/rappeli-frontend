import {
  EXAMPLE_AVERAGE_RESPONSE_TIME_SECONDS,
  EXAMPLE_CONVERSATIONS_TODAY,
} from '@/mocks/sharedExampleMetrics'
import type { DashboardMetrics } from '@/types/dashboard'

/** Métricas de painel quando a API ainda não retorna dados (conta de demonstração). */
export function exampleDashboardMetrics(): DashboardMetrics {
  return {
    conversations_today: EXAMPLE_CONVERSATIONS_TODAY,
    automated_messages_count: 0,
    automated_messages_period_days: 7,
    average_response_time_seconds: EXAMPLE_AVERAGE_RESPONSE_TIME_SECONDS,
    new_contacts_today: 0,
    message_volume: null,
  }
}

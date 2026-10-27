import type { Contact } from '@/types/contacts'

export type ScheduledMessageStatus = 'scheduled' | 'sent' | 'failed' | 'cancelled'

export interface ScheduledMessage {
  id: number
  contact_id: number
  contact?: Contact
  body: string
  scheduled_at: string | null
  status: ScheduledMessageStatus
  repeat_rule: string | null
  sent_at: string | null
  failure_reason: string | null
}

export interface StoreScheduledMessagePayload {
  contact_id: number
  body: string
  scheduled_at: string
  repeat_rule?: 'none' | 'daily' | 'weekly' | null
}

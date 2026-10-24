export type MessageDeliveryStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

export type MessageDirection = 'inbound' | 'outbound'

export type AutomatedReplyKind = 'welcome' | 'out_of_hours' | 'keyword'

export interface InboxContact {
  id: number
  phone: string
  display_name: string | null
  tags?: string[]
}

export interface ConversationMessage {
  id: number
  conversation_id: number
  direction: MessageDirection
  message_type: string
  body: string
  wa_message_id: string | null
  status: MessageDeliveryStatus
  wa_timestamp: string | null
  created_at: string | null
  is_automated?: boolean
  automated_reply_kind?: AutomatedReplyKind | null
}

export interface InboxConversationCounts {
  all: number
  unread: number
  automated: number
  human: number
}

export interface Conversation {
  id: number
  unread_count: number
  whatsapp_phone_number_id: string
  last_message_at: string | null
  last_customer_message_at: string | null
  contact: InboxContact
  last_message: ConversationMessage | null
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  links?: Record<string, string | null>
  meta?: PaginationMeta
}

export interface InboxMessagesPage {
  messages: ConversationMessage[]
  meta: PaginationMeta
}

export interface InboxMessageStatusEvent {
  message_id: number
  conversation_id: number
  wa_message_id: string | null
  status: MessageDeliveryStatus
}

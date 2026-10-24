import { describe, expect, it } from 'vitest'

import type { Conversation } from '@/types/conversations'
import { conversationMatchesFilter, countConversationsByFilter } from '@/utils/conversationFilters'

function conv(partial: Partial<Conversation> & { id: number }): Conversation {
  return {
    id: partial.id,
    unread_count: partial.unread_count ?? 0,
    whatsapp_phone_number_id: '',
    last_message_at: null,
    last_customer_message_at: null,
    contact: partial.contact ?? { id: 1, phone: '5562999999999', display_name: null },
    last_message: partial.last_message ?? null,
  }
}

describe('conversationFilters', () => {
  const list = [
    conv({ id: 1, unread_count: 2 }),
    conv({
      id: 2,
      last_message: {
        id: 1,
        conversation_id: 2,
        direction: 'outbound',
        message_type: 'text',
        body: 'oi',
        wa_message_id: null,
        status: 'sent',
        wa_timestamp: null,
        created_at: null,
        is_automated: true,
      },
    }),
    conv({
      id: 3,
      last_message: {
        id: 2,
        conversation_id: 3,
        direction: 'inbound',
        message_type: 'text',
        body: 'oi',
        wa_message_id: null,
        status: 'delivered',
        wa_timestamp: null,
        created_at: null,
        is_automated: false,
      },
    }),
  ]

  it('counts unread', () => {
    expect(countConversationsByFilter(list, 'unread')).toBe(1)
  })

  it('filters automation by last message is_automated', () => {
    expect(conversationMatchesFilter(list[1]!, 'automation')).toBe(true)
    expect(countConversationsByFilter(list, 'automation')).toBe(1)
  })

  it('filters human when last message is not automated', () => {
    expect(countConversationsByFilter(list, 'human')).toBe(1)
  })
})

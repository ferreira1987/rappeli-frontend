import { describe, expect, it } from 'vitest'

import {
  InboxParseError,
  parseConversationMessage,
  parseInboxConversationsResponse,
} from '@/api/inboxParsing'

describe('parseInboxConversationsResponse', () => {
  const conversation = {
    id: 1,
    unread_count: 0,
    whatsapp_phone_number_id: 'pn',
    last_message_at: '2026-01-01T12:00:00Z',
    last_customer_message_at: null,
    contact: {
      id: 2,
      phone: '5562999999999',
      display_name: 'Cliente',
      tags: ['vip', ''],
    },
    last_message: null,
  }

  it('parses data, counts and meta', () => {
    const result = parseInboxConversationsResponse({
      data: [conversation],
      counts: { all: 1, unread: 0, automated: 0, human: 1 },
      meta: { current_page: 1, last_page: 1, per_page: 50, total: 1 },
    })

    expect(result.conversations).toHaveLength(1)
    const first = result.conversations[0]!
    expect(first.contact.tags).toEqual(['vip'])
    expect(first.last_message).toBeNull()
    expect(result.counts).toEqual({ all: 1, unread: 0, automated: 0, human: 1 })
    expect(result.meta.total).toBe(1)
  })

  it('defaults counts when missing', () => {
    const result = parseInboxConversationsResponse({ data: [] })
    expect(result.counts).toEqual({ all: 0, unread: 0, automated: 0, human: 0 })
  })

  it('throws on invalid data shape', () => {
    expect(() => parseInboxConversationsResponse({ data: null })).toThrow(InboxParseError)
    expect(() => parseInboxConversationsResponse(null)).toThrow(InboxParseError)
  })
})

describe('parseConversationMessage', () => {
  it('parses delivery status fields', () => {
    const message = parseConversationMessage({
      id: 5,
      conversation_id: 2,
      direction: 'outbound',
      message_type: 'text',
      body: 'Teste',
      wa_message_id: 'wamid.x',
      status: 'delivered',
      delivered_at: '2026-01-02T12:00:00Z',
      read_at: null,
      failed_at: null,
      failure_reason: null,
      wa_timestamp: null,
      created_at: '2026-01-02T11:59:00Z',
    })

    expect(message.status).toBe('delivered')
    expect(message.delivered_at).toBe('2026-01-02T12:00:00Z')
  })

  it('throws when status is invalid', () => {
    expect(() =>
      parseConversationMessage({
        id: 1,
        conversation_id: 1,
        direction: 'outbound',
        message_type: 'text',
        body: 'x',
        status: 'unknown',
      }),
    ).toThrow(InboxParseError)
  })
})

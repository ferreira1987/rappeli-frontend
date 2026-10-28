import { describe, expect, it } from 'vitest'

import type { ConversationMessage, InboxMessageStatusEvent } from '@/types/conversations'
import {
  formatMessageDeliveryTooltip,
  mergeMessageStatusFromEvent,
} from '@/utils/messageDeliveryStatus'

const baseMessage: ConversationMessage = {
  id: 10,
  conversation_id: 3,
  direction: 'outbound',
  message_type: 'text',
  body: 'Olá',
  wa_message_id: 'wamid.1',
  status: 'sent',
  delivered_at: null,
  read_at: null,
  failed_at: null,
  failure_reason: null,
  wa_timestamp: null,
  created_at: '2026-03-15T15:00:00.000Z',
}

describe('formatMessageDeliveryTooltip', () => {
  it('formats delivered status with São Paulo timestamp', () => {
    const tooltip = formatMessageDeliveryTooltip({
      status: 'delivered',
      delivered_at: '2026-03-15T15:00:00.000Z',
    })
    expect(tooltip).toContain('Entregue')
    expect(tooltip).toMatch(/15\/03\/2026/)
    expect(tooltip).toMatch(/12:00/)
  })

  it('includes failure reason for failed messages', () => {
    const tooltip = formatMessageDeliveryTooltip({
      status: 'failed',
      failure_reason: 'Número inválido',
      failed_at: '2026-03-15T16:00:00.000Z',
    })
    expect(tooltip).toContain('Falha no envio')
    expect(tooltip).toContain('Número inválido')
  })
})

describe('mergeMessageStatusFromEvent', () => {
  it('updates status fields for matching message id', () => {
    const event: InboxMessageStatusEvent = {
      message_id: 10,
      conversation_id: 3,
      wa_message_id: 'wamid.1',
      status: 'read',
      read_at: '2026-03-15T17:00:00.000Z',
      delivered_at: '2026-03-15T16:30:00.000Z',
    }

    const merged = mergeMessageStatusFromEvent(baseMessage, event)
    expect(merged.status).toBe('read')
    expect(merged.read_at).toBe('2026-03-15T17:00:00.000Z')
    expect(merged.delivered_at).toBe('2026-03-15T16:30:00.000Z')
  })

  it('ignores events for other message ids', () => {
    const event: InboxMessageStatusEvent = {
      message_id: 99,
      conversation_id: 3,
      wa_message_id: null,
      status: 'read',
    }

    const merged = mergeMessageStatusFromEvent(baseMessage, event)
    expect(merged).toEqual(baseMessage)
  })
})

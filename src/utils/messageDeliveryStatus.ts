import type { ConversationMessage, InboxMessageStatusEvent, MessageDeliveryStatus } from '@/types/conversations'
import { formatDateTimeBrazil } from '@/utils/datetime'

const VALID_STATUSES: MessageDeliveryStatus[] = [
  'pending',
  'sent',
  'delivered',
  'read',
  'failed',
]

export function isMessageDeliveryStatus(value: unknown): value is MessageDeliveryStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as MessageDeliveryStatus)
}

export type MessageDeliveryTooltipInput = {
  status: MessageDeliveryStatus | null | undefined
  delivered_at?: string | null
  read_at?: string | null
  failed_at?: string | null
  failure_reason?: string | null
}

export function formatMessageDeliveryTooltip(input: MessageDeliveryTooltipInput): string {
  const status = input.status
  if (!status) {
    return ''
  }

  const lines: string[] = []

  switch (status) {
    case 'pending':
      lines.push('Enviando…')
      break
    case 'sent':
      lines.push('Enviada')
      break
    case 'delivered':
      lines.push('Entregue')
      if (input.delivered_at) {
        lines.push(`Em ${formatDateTimeBrazil(input.delivered_at)}`)
      }
      break
    case 'read':
      lines.push('Lida')
      if (input.read_at) {
        lines.push(`Em ${formatDateTimeBrazil(input.read_at)}`)
      }
      break
    case 'failed':
      lines.push('Falha no envio')
      if (input.failure_reason?.trim()) {
        lines.push(input.failure_reason.trim())
      }
      if (input.failed_at) {
        lines.push(`Em ${formatDateTimeBrazil(input.failed_at)}`)
      }
      break
    default:
      break
  }

  return lines.join('\n')
}

export function mergeMessageStatusFromEvent(
  message: ConversationMessage,
  event: InboxMessageStatusEvent,
): ConversationMessage {
  if (message.id !== event.message_id) {
    return message
  }

  return {
    ...message,
    status: event.status,
    wa_message_id: event.wa_message_id ?? message.wa_message_id,
    delivered_at: event.delivered_at ?? message.delivered_at ?? null,
    read_at: event.read_at ?? message.read_at ?? null,
    failed_at: event.failed_at ?? message.failed_at ?? null,
    failure_reason: event.failure_reason ?? message.failure_reason ?? null,
  }
}

import type {
  Conversation,
  ConversationMessage,
  InboxContact,
  InboxConversationCounts,
  MessageDirection,
  PaginationMeta,
} from '@/types/conversations'
import { isMessageDeliveryStatus } from '@/utils/messageDeliveryStatus'

export class InboxParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InboxParseError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function readNonNegativeInt(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 0
  }
  return Math.floor(value)
}

export function parseInboxConversationCounts(payload: unknown): InboxConversationCounts {
  if (!isRecord(payload)) {
    return { all: 0, unread: 0, automated: 0, human: 0 }
  }

  const counts = payload.counts
  if (!isRecord(counts)) {
    return { all: 0, unread: 0, automated: 0, human: 0 }
  }

  return {
    all: readNonNegativeInt(counts.all),
    unread: readNonNegativeInt(counts.unread),
    automated: readNonNegativeInt(counts.automated),
    human: readNonNegativeInt(counts.human),
  }
}

function readOptionalIso(value: unknown): string | null {
  if (typeof value === 'string') {
    return value
  }
  if (value === null) {
    return null
  }
  return null
}

function readOptionalString(value: unknown): string | null {
  if (typeof value === 'string') {
    return value
  }
  if (value === null) {
    return null
  }
  return null
}

function readMessageDirection(value: unknown): MessageDirection {
  return value === 'inbound' || value === 'outbound' ? value : 'inbound'
}

export function parseConversationMessage(raw: unknown): ConversationMessage {
  if (!isRecord(raw) || typeof raw.id !== 'number' || typeof raw.conversation_id !== 'number') {
    throw new InboxParseError('Mensagem de conversa inválida na resposta da inbox.')
  }

  if (!isMessageDeliveryStatus(raw.status)) {
    throw new InboxParseError('status inválido em mensagem da inbox.')
  }

  if (typeof raw.body !== 'string' || typeof raw.message_type !== 'string') {
    throw new InboxParseError('Campos obrigatórios ausentes em mensagem da inbox.')
  }

  const automatedReplyKind = raw.automated_reply_kind
  const parsedAutomatedReplyKind =
    automatedReplyKind === 'welcome' ||
    automatedReplyKind === 'out_of_hours' ||
    automatedReplyKind === 'keyword'
      ? automatedReplyKind
      : automatedReplyKind === null
        ? null
        : undefined

  return {
    id: raw.id,
    conversation_id: raw.conversation_id,
    direction: readMessageDirection(raw.direction),
    message_type: raw.message_type,
    body: raw.body,
    wa_message_id: readOptionalString(raw.wa_message_id),
    status: raw.status,
    delivered_at: readOptionalIso(raw.delivered_at),
    read_at: readOptionalIso(raw.read_at),
    failed_at: readOptionalIso(raw.failed_at),
    failure_reason: readOptionalString(raw.failure_reason),
    wa_timestamp: readOptionalIso(raw.wa_timestamp),
    created_at: readOptionalIso(raw.created_at),
    ...(typeof raw.is_automated === 'boolean' ? { is_automated: raw.is_automated } : {}),
    ...(parsedAutomatedReplyKind !== undefined
      ? { automated_reply_kind: parsedAutomatedReplyKind }
      : {}),
  }
}

function parseInboxContact(raw: unknown): InboxContact {
  if (!isRecord(raw) || typeof raw.id !== 'number' || typeof raw.phone !== 'string') {
    throw new InboxParseError('Contato de conversa inválido na resposta da inbox.')
  }

  const displayName = raw.display_name
  const tagsRaw = raw.tags
  const tags =
    Array.isArray(tagsRaw)
      ? tagsRaw.filter((tag): tag is string => typeof tag === 'string' && tag.length > 0)
      : []

  return {
    id: raw.id,
    phone: raw.phone,
    display_name: typeof displayName === 'string' || displayName === null ? displayName : null,
    ...(tags.length > 0 ? { tags } : {}),
  }
}

function parseConversationItem(raw: unknown): Conversation {
  if (!isRecord(raw) || typeof raw.id !== 'number') {
    throw new InboxParseError('Item de conversa inválido na resposta da inbox.')
  }

  const lastMessage = raw.last_message
  let parsedLastMessage: Conversation['last_message'] = null
  if (lastMessage != null) {
    parsedLastMessage = parseConversationMessage(lastMessage)
  }

  return {
    id: raw.id,
    unread_count: readNonNegativeInt(raw.unread_count),
    whatsapp_phone_number_id:
      typeof raw.whatsapp_phone_number_id === 'string' ? raw.whatsapp_phone_number_id : '',
    last_message_at:
      typeof raw.last_message_at === 'string' || raw.last_message_at === null
        ? raw.last_message_at
        : null,
    last_customer_message_at:
      typeof raw.last_customer_message_at === 'string' || raw.last_customer_message_at === null
        ? raw.last_customer_message_at
        : null,
    contact: parseInboxContact(raw.contact),
    last_message: parsedLastMessage,
  }
}

function parsePaginationMeta(meta: unknown): PaginationMeta {
  if (!isRecord(meta)) {
    return { current_page: 1, last_page: 1, per_page: 50 }
  }
  return {
    current_page: readNonNegativeInt(meta.current_page) || 1,
    last_page: readNonNegativeInt(meta.last_page) || 1,
    per_page: readNonNegativeInt(meta.per_page) || 50,
    total: typeof meta.total === 'number' ? meta.total : undefined,
  }
}

export type InboxConversationsPage = {
  conversations: Conversation[]
  counts: InboxConversationCounts
  meta: PaginationMeta
}

export function parseInboxConversationsResponse(payload: unknown): InboxConversationsPage {
  if (!isRecord(payload)) {
    throw new InboxParseError(
      'Resposta inválida de /api/inbox/conversations: objeto JSON esperado.',
    )
  }

  const data = payload.data
  if (!Array.isArray(data)) {
    throw new InboxParseError(
      'Resposta inválida de /api/inbox/conversations: array em data esperado.',
    )
  }

  return {
    conversations: data.map((item) => parseConversationItem(item)),
    counts: parseInboxConversationCounts(payload),
    meta: parsePaginationMeta(payload.meta),
  }
}

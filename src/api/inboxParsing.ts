import type {
  Conversation,
  InboxContact,
  InboxConversationCounts,
  PaginationMeta,
} from '@/types/conversations'

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
    if (!isRecord(lastMessage) || typeof lastMessage.id !== 'number') {
      throw new InboxParseError('last_message inválido na resposta da inbox.')
    }
    parsedLastMessage = lastMessage as unknown as Conversation['last_message']
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

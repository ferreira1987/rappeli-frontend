import type { ConversationMessage } from '@/types/conversations'

export function sortMessagesChronologically(messages: ConversationMessage[]): ConversationMessage[] {
  return [...messages].sort((a, b) => {
    const aKey = messageSortKey(a)
    const bKey = messageSortKey(b)
    if (aKey !== bKey) {
      return aKey - bKey
    }
    return a.id - b.id
  })
}

function messageSortKey(message: ConversationMessage): number {
  if (message.created_at) {
    const parsed = Date.parse(message.created_at)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }
  if (message.wa_timestamp) {
    const parsed = Date.parse(message.wa_timestamp)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }
  return message.id
}

export function upsertMessage(
  list: ConversationMessage[],
  incoming: ConversationMessage,
): ConversationMessage[] {
  const index = list.findIndex(
    (message) =>
      message.id === incoming.id ||
      (incoming.wa_message_id != null &&
        message.wa_message_id != null &&
        message.wa_message_id === incoming.wa_message_id),
  )

  const next =
    index >= 0
      ? list.map((message, i) => (i === index ? { ...message, ...incoming } : message))
      : [...list, incoming]

  return sortMessagesChronologically(next)
}

export function mergeMessagePages(
  olderPageNewestFirst: ConversationMessage[],
  existing: ConversationMessage[],
): ConversationMessage[] {
  const olderChronological = [...olderPageNewestFirst].reverse()
  let merged = existing
  for (const message of olderChronological) {
    merged = upsertMessage(merged, message)
  }
  return merged
}

export function pageToChronological(pageNewestFirst: ConversationMessage[]): ConversationMessage[] {
  return sortMessagesChronologically([...pageNewestFirst].reverse())
}

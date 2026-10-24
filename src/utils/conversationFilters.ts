import type { Conversation } from '@/types/conversations'

export type ConversationFilterTab = 'all' | 'unread' | 'automation' | 'human'

export function conversationMatchesFilter(
  conversation: Conversation,
  tab: ConversationFilterTab,
): boolean {
  switch (tab) {
    case 'all':
      return true
    case 'unread':
      return (conversation.unread_count ?? 0) > 0
    case 'automation':
      return conversation.last_message?.is_automated === true
    case 'human':
      return conversation.last_message != null && conversation.last_message.is_automated !== true
    default:
      return true
  }
}

export function countConversationsByFilter(
  conversations: Conversation[],
  tab: ConversationFilterTab,
): number {
  return conversations.filter((conversation) => conversationMatchesFilter(conversation, tab))
    .length
}

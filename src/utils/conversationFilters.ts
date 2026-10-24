import type { InboxConversationCounts } from '@/types/conversations'

export type ConversationFilterTab = 'all' | 'unread' | 'automation' | 'human'

export type InboxConversationFilter = 'all' | 'unread' | 'automated' | 'human'

export function inboxFilterFromTab(tab: ConversationFilterTab): InboxConversationFilter {
  if (tab === 'automation') {
    return 'automated'
  }
  return tab
}

export function filterCountsFromApi(counts: InboxConversationCounts): Record<ConversationFilterTab, number> {
  return {
    all: counts.all,
    unread: counts.unread,
    automation: counts.automated,
    human: counts.human,
  }
}

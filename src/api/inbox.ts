import { http } from '@/api/http'
import {
  type InboxConversationsPage,
  parseInboxConversationsResponse,
} from '@/api/inboxParsing'
import type {
  Conversation,
  ConversationMessage,
  InboxMessagesPage,
  PaginatedResponse,
  PaginationMeta,
} from '@/types/conversations'
import type { InboxConversationFilter } from '@/utils/conversationFilters'

const DEFAULT_PER_PAGE = 50

export type FetchConversationsParams = {
  search?: string
  per_page?: number
  filter?: InboxConversationFilter
}

export type FetchMessagesParams = {
  page?: number
  per_page?: number
}

function parsePaginationMeta(meta: PaginatedResponse<unknown>['meta']): PaginationMeta {
  return {
    current_page: meta?.current_page ?? 1,
    last_page: meta?.last_page ?? 1,
    per_page: meta?.per_page ?? DEFAULT_PER_PAGE,
    total: meta?.total,
  }
}

export async function fetchInboxConversations(
  params: FetchConversationsParams = {},
): Promise<InboxConversationsPage> {
  const { data } = await http.get<unknown>('/api/inbox/conversations', {
    params: {
      per_page: params.per_page ?? DEFAULT_PER_PAGE,
      filter: params.filter ?? 'all',
      ...(params.search ? { search: params.search } : {}),
    },
  })
  return parseInboxConversationsResponse(data)
}

export async function fetchInboxMessagesPage(
  conversationId: number,
  params: FetchMessagesParams = {},
): Promise<InboxMessagesPage> {
  const { data } = await http.get<PaginatedResponse<ConversationMessage>>(
    `/api/inbox/conversations/${conversationId}/messages`,
    {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? DEFAULT_PER_PAGE,
      },
    },
  )

  return {
    messages: data.data ?? [],
    meta: parsePaginationMeta(data.meta),
  }
}

export async function sendInboxMessage(
  conversationId: number,
  body: string,
): Promise<ConversationMessage> {
  const { data } = await http.post<ConversationMessage>(
    `/api/inbox/conversations/${conversationId}/messages`,
    { body },
  )
  return data
}

export async function markInboxConversationRead(conversationId: number): Promise<Conversation> {
  const { data } = await http.post<Conversation>(
    `/api/inbox/conversations/${conversationId}/read`,
  )
  return data
}

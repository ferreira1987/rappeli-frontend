import { http } from '@/api/http'
import {
  type InboxConversationsPage,
  parseConversationMessage,
  parseInboxConversationsResponse,
} from '@/api/inboxParsing'
import { parseResourceCollection } from '@/api/resource'
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

  const rawMessages = data.data ?? []

  return {
    messages: rawMessages.map((item) => parseConversationMessage(item)),
    meta: parsePaginationMeta(data.meta),
  }
}

export async function sendInboxMessage(
  conversationId: number,
  body: string,
): Promise<ConversationMessage> {
  const { data } = await http.post<unknown>(
    `/api/inbox/conversations/${conversationId}/messages`,
    { body },
  )
  return parseConversationMessage(data)
}

export async function markInboxConversationRead(conversationId: number): Promise<Conversation> {
  const { data } = await http.post<Conversation>(
    `/api/inbox/conversations/${conversationId}/read`,
  )
  return data
}

export interface ConversationActivity {
  id: number
  type: string
  label?: string | null
  payload: Record<string, unknown> | null
  actor_user_id: number | null
  created_at: string | null
}

export type TransferConversationPayload = {
  assignee_user_id?: number | null
  sector_id?: number | null
  note?: string | null
  notify_client?: boolean
}

export async function transferInboxConversation(
  conversationId: number,
  payload: TransferConversationPayload,
): Promise<Conversation> {
  const { data } = await http.post<Conversation>(
    `/api/inbox/conversations/${conversationId}/transfer`,
    payload,
  )
  return data
}

export async function resolveInboxConversation(conversationId: number): Promise<Conversation> {
  const { data } = await http.post<Conversation>(
    `/api/inbox/conversations/${conversationId}/resolve`,
  )
  return data
}

export async function fetchConversationActivities(
  conversationId: number,
): Promise<ConversationActivity[]> {
  const { data } = await http.get<unknown>(
    `/api/inbox/conversations/${conversationId}/activities`,
  )
  return parseResourceCollection<ConversationActivity>(data)
}

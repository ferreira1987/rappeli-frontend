import { http } from '@/api/http'
import type {
  Conversation,
  ConversationMessage,
  PaginatedResponse,
} from '@/types/conversations'

const DEFAULT_PER_PAGE = 50

export type FetchConversationsParams = {
  search?: string
  per_page?: number
}

export type FetchMessagesParams = {
  per_page?: number
}

export async function fetchInboxConversations(
  params: FetchConversationsParams = {},
): Promise<Conversation[]> {
  const { data } = await http.get<PaginatedResponse<Conversation>>('/api/inbox/conversations', {
    params: {
      per_page: params.per_page ?? DEFAULT_PER_PAGE,
      ...(params.search ? { search: params.search } : {}),
    },
  })
  return data.data ?? []
}

export async function fetchInboxMessages(
  conversationId: number,
  params: FetchMessagesParams = {},
): Promise<ConversationMessage[]> {
  const { data } = await http.get<PaginatedResponse<ConversationMessage>>(
    `/api/inbox/conversations/${conversationId}/messages`,
    {
      params: {
        per_page: params.per_page ?? DEFAULT_PER_PAGE,
      },
    },
  )
  return data.data ?? []
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

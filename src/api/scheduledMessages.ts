import { http } from '@/api/http'
import { parsePaginatedResource, unwrapData } from '@/api/resource'
import type {
  ScheduledMessage,
  ScheduledMessageStatus,
  StoreScheduledMessagePayload,
} from '@/types/scheduledMessages'
import type { PaginationMeta } from '@/types/conversations'

export async function fetchScheduledMessages(params: {
  status?: ScheduledMessageStatus
  per_page?: number
  page?: number
}): Promise<{ messages: ScheduledMessage[]; meta: PaginationMeta }> {
  const { data } = await http.get<unknown>('/api/scheduled-messages', {
    params: {
      per_page: params.per_page ?? 50,
      page: params.page ?? 1,
      ...(params.status ? { status: params.status } : {}),
    },
  })
  const parsed = parsePaginatedResource<ScheduledMessage>(data)
  return { messages: parsed.items, meta: parsed.meta }
}

export async function createScheduledMessage(
  payload: StoreScheduledMessagePayload,
): Promise<ScheduledMessage> {
  const { data } = await http.post<unknown>('/api/scheduled-messages', payload)
  return unwrapData<ScheduledMessage>(data)
}

export async function updateScheduledMessage(
  id: number,
  payload: Partial<StoreScheduledMessagePayload>,
): Promise<ScheduledMessage> {
  const { data } = await http.patch<unknown>(`/api/scheduled-messages/${id}`, payload)
  return unwrapData<ScheduledMessage>(data)
}

export async function deleteScheduledMessage(id: number): Promise<void> {
  await http.delete(`/api/scheduled-messages/${id}`)
}

export async function cancelScheduledMessage(id: number): Promise<ScheduledMessage> {
  const { data } = await http.post<unknown>(`/api/scheduled-messages/${id}/cancel`)
  return unwrapData<ScheduledMessage>(data)
}

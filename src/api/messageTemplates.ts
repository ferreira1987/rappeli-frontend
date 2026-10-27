import { http } from '@/api/http'
import { parseResourceCollection } from '@/api/resource'
import type { MessageTemplate } from '@/types/campaigns'

export async function fetchMessageTemplates(): Promise<MessageTemplate[]> {
  const { data } = await http.get<unknown>('/api/message-templates')
  return parseResourceCollection<MessageTemplate>(data)
}

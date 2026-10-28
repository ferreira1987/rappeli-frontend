import { http } from '@/api/http'
import { parseResourceCollection, unwrapData } from '@/api/resource'
import type {
  CreateMessageTemplatePayload,
  MessageTemplate,
} from '@/types/messageTemplates'

export interface MessageTemplatesListResult {
  templates: MessageTemplate[]
  whatsappConfigured: boolean
}

function parseWhatsappConfigured(payload: unknown): boolean {
  const meta = (payload as { meta?: { whatsapp_configured?: boolean } })?.meta
  return Boolean(meta?.whatsapp_configured)
}

export async function fetchMessageTemplatesList(): Promise<MessageTemplatesListResult> {
  const { data } = await http.get<unknown>('/api/message-templates')
  return {
    templates: parseResourceCollection<MessageTemplate>(data),
    whatsappConfigured: parseWhatsappConfigured(data),
  }
}

export async function fetchMessageTemplates(): Promise<MessageTemplate[]> {
  const { templates } = await fetchMessageTemplatesList()
  return templates
}

export async function syncMessageTemplates(): Promise<{
  templates: MessageTemplate[]
  synced: number
}> {
  const { data } = await http.post<unknown>('/api/message-templates/sync')
  const synced = (data as { meta?: { synced?: number } })?.meta?.synced ?? 0
  return {
    templates: parseResourceCollection<MessageTemplate>(data),
    synced,
  }
}

export async function createMessageTemplate(
  payload: CreateMessageTemplatePayload,
): Promise<MessageTemplate> {
  const { data } = await http.post<unknown>('/api/message-templates', payload)
  return unwrapData<MessageTemplate>(data)
}

export async function fetchMessageTemplate(id: number): Promise<MessageTemplate> {
  const { data } = await http.get<unknown>(`/api/message-templates/${id}`)
  return unwrapData<MessageTemplate>(data)
}

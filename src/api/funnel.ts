import { http } from '@/api/http'
import { unwrapData } from '@/api/resource'
import type { FunnelBoard, FunnelCard, FunnelStage } from '@/types/funnel'

export async function fetchFunnelBoard(): Promise<FunnelBoard> {
  const { data } = await http.get<unknown>('/api/funnel')
  return unwrapData<FunnelBoard>(data)
}

export async function createFunnelStage(payload: {
  title: string
  slug?: string | null
  color?: string | null
  position?: number
}): Promise<FunnelStage> {
  const { data } = await http.post<unknown>('/api/funnel/stages', payload)
  return unwrapData<FunnelStage>(data)
}

export async function updateFunnelStage(
  stageId: number,
  payload: Partial<{ title: string; slug: string; color: string; position: number }>,
): Promise<FunnelStage> {
  const { data } = await http.patch<unknown>(`/api/funnel/stages/${stageId}`, payload)
  return unwrapData<FunnelStage>(data)
}

export async function deleteFunnelStage(stageId: number): Promise<void> {
  await http.delete(`/api/funnel/stages/${stageId}`)
}

export async function reorderFunnelStages(stageIds: number[]): Promise<void> {
  await http.patch('/api/funnel/stages/reorder', { stage_ids: stageIds })
}

export async function createFunnelCard(payload: {
  funnel_stage_id: number
  contact_id?: number | null
  conversation_id?: number | null
  contact_name?: string | null
  phone?: string | null
  last_message?: string | null
  tags?: string[]
  position?: number
}): Promise<FunnelCard> {
  const { data } = await http.post<unknown>('/api/funnel/cards', payload)
  return unwrapData<FunnelCard>(data)
}

export async function moveFunnelCard(
  cardId: number,
  payload: { funnel_stage_id: number; position?: number },
): Promise<FunnelCard> {
  const { data } = await http.patch<unknown>(`/api/funnel/cards/${cardId}/move`, payload)
  return unwrapData<FunnelCard>(data)
}

export async function updateFunnelCard(
  cardId: number,
  payload: Partial<{
    contact_name: string
    phone: string
    last_message: string
    tags: string[]
    assigned_user_id: number | null
  }>,
): Promise<FunnelCard> {
  const { data } = await http.patch<unknown>(`/api/funnel/cards/${cardId}`, payload)
  return unwrapData<FunnelCard>(data)
}

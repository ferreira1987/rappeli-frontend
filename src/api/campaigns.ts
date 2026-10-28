import { http } from '@/api/http'
import { parseResourceCollection, unwrapData } from '@/api/resource'
import type { Campaign, CampaignSegmentPreview, CampaignStatus } from '@/types/campaigns'

export async function fetchCampaigns(): Promise<Campaign[]> {
  const { data } = await http.get<unknown>('/api/campaigns')
  return parseResourceCollection<Campaign>(data)
}

export async function fetchCampaign(id: number): Promise<Campaign> {
  const campaigns = await fetchCampaigns()
  const campaign = campaigns.find((item) => item.id === id)
  if (!campaign) {
    throw new Error('Campanha não encontrada.')
  }
  return campaign
}

export async function createCampaign(payload: {
  name: string
  description?: string | null
  segment_tags?: string[] | null
  opt_in_only?: boolean
  message_template_id?: number | null
  status?: CampaignStatus
  scheduled_at?: string | null
  send_rate?: string | null
}): Promise<Campaign> {
  const { data } = await http.post<unknown>('/api/campaigns', payload)
  return unwrapData<Campaign>(data)
}

export async function updateCampaign(
  id: number,
  payload: Partial<{
    name: string
    description: string | null
    segment_tags: string[] | null
    opt_in_only: boolean
    message_template_id: number | null
    status: CampaignStatus
    scheduled_at: string | null
    send_rate: string | null
  }>,
): Promise<Campaign> {
  const { data } = await http.patch<unknown>(`/api/campaigns/${id}`, payload)
  return unwrapData<Campaign>(data)
}

export async function deleteCampaign(id: number): Promise<void> {
  await http.delete(`/api/campaigns/${id}`)
}

export async function fetchCampaignSegmentPreview(
  campaignId: number,
): Promise<CampaignSegmentPreview> {
  const { data } = await http.get<unknown>(`/api/campaigns/${campaignId}/segment-preview`)
  return unwrapData<CampaignSegmentPreview>(data)
}

export interface CampaignSendNowResult {
  id: number
  status: string
  queued: boolean
}

export async function sendCampaignNow(campaignId: number): Promise<CampaignSendNowResult> {
  const { data } = await http.post<unknown>(`/api/campaigns/${campaignId}/send-now`)
  return unwrapData<CampaignSendNowResult>(data)
}

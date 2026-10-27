import { fetchCsrfCookie } from '@/api/auth'
import { http } from '@/api/http'
import { parseResourceCollection, unwrapData } from '@/api/resource'
import type {
  AcceptTeamInvitationPayload,
  AcceptTeamInvitationResult,
  Sector,
  TeamAgent,
  TeamDistributionSettings,
  TeamInvitationPayload,
  TeamInvitationPreview,
} from '@/types/team'

export async function fetchSectors(): Promise<Sector[]> {
  const { data } = await http.get<unknown>('/api/sectors')
  return parseResourceCollection<Sector>(data)
}

export async function fetchSector(id: number): Promise<Sector> {
  const { data } = await http.get<unknown>(`/api/sectors/${id}`)
  return unwrapData<Sector>(data)
}

export async function createSector(payload: {
  name: string
  description?: string | null
  position?: number
}): Promise<Sector> {
  const { data } = await http.post<unknown>('/api/sectors', payload)
  return unwrapData<Sector>(data)
}

export async function updateSector(
  id: number,
  payload: Partial<{ name: string; description: string | null; position: number }>,
): Promise<Sector> {
  const { data } = await http.patch<unknown>(`/api/sectors/${id}`, payload)
  return unwrapData<Sector>(data)
}

export async function deleteSector(id: number): Promise<void> {
  await http.delete(`/api/sectors/${id}`)
}

export async function fetchTeamInvitationPreview(token: string): Promise<TeamInvitationPreview> {
  const { data } = await http.get<unknown>(`/api/team/invitations/${encodeURIComponent(token)}`)
  return unwrapData<TeamInvitationPreview>(data)
}

export async function fetchTeamAgents(): Promise<TeamAgent[]> {
  const { data } = await http.get<unknown>('/api/team/agents')
  return parseResourceCollection<TeamAgent>(data)
}

export async function updateTeamAgent(
  id: number,
  payload: Partial<{
    role: string
    sector_id: number | null
    phone: string | null
    receives_chats: boolean
  }>,
): Promise<TeamAgent> {
  const { data } = await http.patch<unknown>(`/api/team/agents/${id}`, payload)
  return unwrapData<TeamAgent>(data)
}

export async function inviteTeamMember(payload: TeamInvitationPayload): Promise<void> {
  await http.post('/api/team/invitations', payload)
}

export async function acceptTeamInvitation(
  payload: AcceptTeamInvitationPayload,
): Promise<AcceptTeamInvitationResult> {
  await fetchCsrfCookie()
  const { data } = await http.post<unknown>('/api/team/invitations/accept', {
    token: payload.token,
    password: payload.password,
    password_confirmation: payload.password_confirmation,
    terms_accepted: payload.terms_accepted,
  })
  return unwrapData<AcceptTeamInvitationResult>(data)
}

export async function fetchDistributionSettings(): Promise<TeamDistributionSettings> {
  const { data } = await http.get<unknown>('/api/team/distribution-settings')
  return unwrapData<TeamDistributionSettings>(data)
}

export async function updateDistributionSettings(
  payload: Partial<TeamDistributionSettings>,
): Promise<TeamDistributionSettings> {
  const { data } = await http.put<unknown>('/api/team/distribution-settings', payload)
  return unwrapData<TeamDistributionSettings>(data)
}

export async function downloadTeamAgentsCsv(): Promise<Blob> {
  const { data } = await http.get<Blob>('/api/team/agents/export.csv', {
    responseType: 'blob',
  })
  return data
}

export type TeamAgentRole = 'atendente' | 'supervisor' | 'administrador'

export interface Sector {
  id: number
  name: string
  description: string | null
  is_default: boolean
  position: number
  agents?: TeamAgent[]
}

/** Pending invite row — `GET /api/team/invitations` (TeamInvitationResource). */
export interface TeamInvitation {
  id: number
  name: string | null
  email: string
  role: TeamAgentRole
  sector_id: number | null
  expires_at: string | null
  email_queued?: boolean
}

export interface TeamInvitationPreview {
  valid: boolean
  message: string | null
  email: string | null
  name: string | null
  role: TeamAgentRole | string | null
  company_name: string | null
  expires_at: string | null
}

export interface TeamAgent {
  id: number
  name: string
  email: string
  role: TeamAgentRole
  phone: string | null
  sector_id: number | null
  whatsapp_presence: string | null
  receives_chats: boolean
}

export interface TeamDistributionSettings {
  routing_method: 'round_robin' | 'least_busy' | 'manual'
  respect_chat_limit: boolean
  chat_limit: number
  overflow_to_sector_queue: boolean
  default_sector_id: number | null
}

export interface TeamInvitationPayload {
  name?: string | null
  email: string
  role?: TeamAgentRole | null
  sector_id?: number | null
}

export interface AcceptTeamInvitationPayload {
  token: string
  password: string
  password_confirmation: string
  terms_accepted: boolean
}

export interface AcceptTeamInvitationResult {
  id: number
  email: string
  name: string
}

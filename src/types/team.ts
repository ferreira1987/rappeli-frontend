export type TeamAgentRole = 'atendente' | 'supervisor' | 'administrador'

export interface Sector {
  id: number
  name: string
  description: string | null
  is_default: boolean
  position: number
  agents?: TeamAgent[]
}

export type TeamInvitationStatus = 'pending'

/** `GET /api/team/invitations` — TeamPendingInvitationResource (PR #17). */
export interface TeamPendingInvitation {
  id: number
  name: string | null
  email: string
  role: TeamAgentRole | null
  sector_id: number | null
  expires_at: string | null
  status: TeamInvitationStatus
}

/** `POST /api/team/invitations` — TeamInvitationResource (create). */
export interface TeamInvitationCreated {
  id: number
  name: string | null
  email: string
  role: TeamAgentRole | null
  sector_id: number | null
  expires_at: string | null
  token?: string
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

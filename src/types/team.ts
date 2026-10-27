export type TeamAgentRole = 'atendente' | 'supervisor' | 'administrador'

export interface Sector {
  id: number
  name: string
  description: string | null
  is_default: boolean
  position: number
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
  email: string
  role?: TeamAgentRole | null
  sector_id?: number | null
}

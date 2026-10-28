import type { TeamAgentRole } from '@/types/team'

export interface User {
  id: number
  name: string
  email: string
  email_verified_at?: string | null
  /** Present when the backend exposes the tenant for broadcasting. */
  company_id?: number | null
  /** From GET /api/me — used for permissões de configuração. */
  role?: TeamAgentRole | null
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  password_confirmation: string
  terms_accepted: boolean
  company_name?: string | null
  business_whatsapp?: string | null
}

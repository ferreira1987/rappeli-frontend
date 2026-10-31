export interface FunnelCard {
  id: number
  funnel_stage_id: number
  contact_id: number | null
  conversation_id: number | null
  assigned_user_id: number | null
  contact_name: string | null
  phone: string | null
  last_message: string | null
  tags: string[]
  position: number
  /** Present when the API includes card timestamps. */
  updated_at?: string | null
}

export interface FunnelStage {
  id: number
  slug: string
  title: string
  color: string | null
  position: number
  cards?: FunnelCard[]
}

export interface FunnelBoard {
  stages: FunnelStage[]
}

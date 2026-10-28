export type CampaignStatus = 'rascunho' | 'agendada' | 'enviando' | 'concluida'

export interface MessageTemplate {
  id: number
  name: string
  category: string | null
  locale: string | null
  approved: boolean
  body: string | null
  footer: string | null
  marketing: boolean
}

export interface Campaign {
  id: number
  name: string
  description: string | null
  segment_tags: string[] | null
  opt_in_only: boolean
  message_template_id: number | null
  template?: MessageTemplate | null
  status: CampaignStatus
  scheduled_at: string | null
  send_rate: string | null
  sent_count: number
  delivered_count: number
  read_count: number
  failed_count?: number
}

export interface CampaignSegmentPreview {
  count: number
  opt_in_only: boolean
}

export interface SequenceStep {
  id: number
  position: number
  kind: string
  label: string | null
  message_template_id: number | null
  preview: string | null
  wait_minutes: number | null
  condition_config: Record<string, unknown> | null
}

export interface Sequence {
  id: number
  name: string
  description: string | null
  trigger: string | null
  filters: Record<string, unknown> | null
  stop_on_reply: boolean
  opt_in_only: boolean
  window_start: string | null
  window_end: string | null
  sector_on_reply: number | null
  active: boolean
  contacts_in_progress: number
  steps?: SequenceStep[]
}

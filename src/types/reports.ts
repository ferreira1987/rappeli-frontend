export type ReportPeriod = `${number}d` | '7d' | '30d'

export interface ReportKpis {
  conversations_handled: number
  conversations_resolved: number
  conversations_open: number
  conversations_open_unassigned: number
  average_response_time_seconds: number | null
  average_first_response_time_seconds: number | null
  new_contacts: number
  automated_messages: number
  period_days: number
}

export interface ReportAgentRow {
  user_id: number
  name: string
  email?: string | null
  conversations_handled: number
  messages_sent: number
  conversations_resolved: number
  conversations_open: number
  average_first_response_time_seconds: number | null
}

export interface ReportCampaignRow {
  id: number
  name: string
  status: string
  sent_count: number
  delivered_count: number
  read_count: number
  failed_count?: number
}

/** Série diária opcional retornada pela API de relatórios. */
export interface ReportConversationVolumePoint {
  date: string
  conversations_handled?: number
  conversations_resolved?: number
  conversations_started?: number
  handled?: number
  resolved?: number
}

export interface ReportConversationVolume {
  period_days?: number
  points?: ReportConversationVolumePoint[]
}

export interface ReportPayload {
  period: string
  meta?: {
    first_response_time_aggregation?: string | null
  }
  kpis: ReportKpis
  agents: ReportAgentRow[]
  campaigns: ReportCampaignRow[]
  conversation_volume?: ReportConversationVolume | null
}

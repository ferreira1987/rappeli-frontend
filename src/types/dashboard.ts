export interface DashboardMessageVolumePoint {
  date: string
  outbound: number
  inbound: number
}

export interface DashboardMessageVolume {
  period_days: number
  points: DashboardMessageVolumePoint[]
}

export interface DashboardMetrics {
  conversations_today: number | null
  automated_messages_count: number | null
  automated_messages_period_days: number | null
  average_response_time_seconds: number | null
  new_contacts_today: number | null
  message_volume: DashboardMessageVolume | null
}

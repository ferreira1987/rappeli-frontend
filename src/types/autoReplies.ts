export type KeywordMatchType = 'exact' | 'contains'

export interface WelcomeAutoReply {
  enabled: boolean
  message: string
  inactivity_hours: number
}

export interface OutOfHoursSlot {
  day_of_week: number
  enabled: boolean
  start_time: string
  end_time: string
}

export interface OutOfHoursAutoReply {
  enabled: boolean
  timezone: string
  message: string
  cooldown_minutes: number
  slots: OutOfHoursSlot[]
}

export interface KeywordRule {
  id: number
  keyword: string
  message: string
  match_type: KeywordMatchType
  priority: number
  is_active: boolean
}

export type KeywordRuleInput = Omit<KeywordRule, 'id'> & { id?: number }

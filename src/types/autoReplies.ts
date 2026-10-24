export type KeywordMatchType = 'exact' | 'contains'

export type AutomatedReplyKind = 'welcome' | 'out_of_hours' | 'keyword'

export interface WelcomeAutoReply {
  enabled: boolean
  message: string | null
  inactivity_hours: number | null
  updated_at: string | null
}

export interface BusinessHourSlot {
  day_of_week: number
  is_closed: boolean
  opens_at: string | null
  closes_at: string | null
}

export interface OutOfHoursAutoReply {
  enabled: boolean
  timezone: string
  message: string | null
  cooldown_minutes: number
  business_hours: BusinessHourSlot[]
  updated_at: string | null
}

export interface KeywordRule {
  id: number
  keyword: string
  match_type: KeywordMatchType
  response_body: string
  is_active: boolean
  priority: number
  created_at: string
  updated_at: string
}

export type KeywordRuleWrite = Pick<
  KeywordRule,
  'keyword' | 'match_type' | 'response_body' | 'is_active' | 'priority'
>

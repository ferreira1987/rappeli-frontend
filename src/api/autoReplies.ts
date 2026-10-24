import { http } from '@/api/http'
import type {
  BusinessHourSlot,
  KeywordRule,
  KeywordRuleWrite,
  OutOfHoursAutoReply,
  WelcomeAutoReply,
} from '@/types/autoReplies'

type OutOfHoursApiResponse = {
  data: OutOfHoursAutoReply
}

export function createDefaultBusinessHours(): BusinessHourSlot[] {
  return Array.from({ length: 7 }, (_, day) => {
    const isClosed = day === 0 || day === 6
    return {
      day_of_week: day,
      is_closed: isClosed,
      opens_at: isClosed ? null : '09:00',
      closes_at: isClosed ? null : '18:00',
    }
  })
}

function orderBusinessHours(slots: BusinessHourSlot[]): BusinessHourSlot[] {
  const byDay = new Map(slots.map((slot) => [slot.day_of_week, slot]))
  return Array.from({ length: 7 }, (_, day) => {
    return (
      byDay.get(day) ?? {
        day_of_week: day,
        is_closed: true,
        opens_at: null,
        closes_at: null,
      }
    )
  })
}

function normalizeOutOfHours(payload: OutOfHoursAutoReply): OutOfHoursAutoReply {
  return {
    ...payload,
    business_hours: orderBusinessHours(payload.business_hours ?? []),
  }
}

export async function fetchWelcomeAutoReply(): Promise<WelcomeAutoReply> {
  const { data } = await http.get<WelcomeAutoReply>('/api/auto-replies/welcome')
  return data
}

export async function updateWelcomeAutoReply(payload: WelcomeAutoReply): Promise<WelcomeAutoReply> {
  const { data } = await http.put<WelcomeAutoReply>('/api/auto-replies/welcome', {
    enabled: payload.enabled,
    message: payload.message,
    inactivity_hours: payload.inactivity_hours,
  })
  return data
}

export async function fetchOutOfHoursAutoReply(): Promise<OutOfHoursAutoReply> {
  const { data } = await http.get<OutOfHoursApiResponse>('/api/auto-replies/out-of-hours')
  return normalizeOutOfHours(data.data)
}

export async function updateOutOfHoursAutoReply(
  payload: OutOfHoursAutoReply,
): Promise<OutOfHoursAutoReply> {
  const { data } = await http.put<OutOfHoursApiResponse>('/api/auto-replies/out-of-hours', {
    enabled: payload.enabled,
    timezone: payload.timezone,
    message: payload.message,
    cooldown_minutes: payload.cooldown_minutes,
    business_hours: payload.business_hours,
  })
  return normalizeOutOfHours(data.data)
}

export async function fetchKeywordRules(): Promise<KeywordRule[]> {
  const { data } = await http.get<KeywordRule[]>('/api/auto-replies/keyword-rules')
  return data
}

export async function createKeywordRule(payload: KeywordRuleWrite): Promise<KeywordRule> {
  const { data } = await http.post<KeywordRule>('/api/auto-replies/keyword-rules', payload)
  return data
}

export async function updateKeywordRule(
  id: number,
  payload: KeywordRuleWrite,
): Promise<KeywordRule> {
  const { data } = await http.put<KeywordRule>(`/api/auto-replies/keyword-rules/${id}`, payload)
  return data
}

export async function deleteKeywordRule(id: number): Promise<void> {
  await http.delete(`/api/auto-replies/keyword-rules/${id}`)
}

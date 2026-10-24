import { http } from '@/api/http'
import {
  parseKeywordRulePayload,
  parseKeywordRulesPayload,
  parseOutOfHoursPayload,
} from '@/api/autoRepliesParsing'
import type {
  BusinessHourSlot,
  KeywordRule,
  KeywordRuleWrite,
  OutOfHoursAutoReply,
  WelcomeAutoReply,
} from '@/types/autoReplies'

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
  const { data } = await http.get<unknown>('/api/auto-replies/out-of-hours')
  return parseOutOfHoursPayload(data)
}

export async function updateOutOfHoursAutoReply(
  payload: OutOfHoursAutoReply,
): Promise<OutOfHoursAutoReply> {
  const { data } = await http.put<unknown>('/api/auto-replies/out-of-hours', {
    enabled: payload.enabled,
    timezone: payload.timezone,
    message: payload.message,
    cooldown_minutes: payload.cooldown_minutes,
    business_hours: payload.business_hours,
  })
  return parseOutOfHoursPayload(data)
}

export async function fetchKeywordRules(): Promise<KeywordRule[]> {
  const { data } = await http.get<unknown>('/api/auto-replies/keyword-rules')
  return parseKeywordRulesPayload(data)
}

export async function createKeywordRule(payload: KeywordRuleWrite): Promise<KeywordRule> {
  const { data } = await http.post<unknown>('/api/auto-replies/keyword-rules', payload)
  return parseKeywordRulePayload(data)
}

export async function updateKeywordRule(
  id: number,
  payload: KeywordRuleWrite,
): Promise<KeywordRule> {
  const { data } = await http.put<unknown>(`/api/auto-replies/keyword-rules/${id}`, payload)
  return parseKeywordRulePayload(data)
}

export async function deleteKeywordRule(id: number): Promise<void> {
  await http.delete(`/api/auto-replies/keyword-rules/${id}`)
}

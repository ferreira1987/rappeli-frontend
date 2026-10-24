import { http } from '@/api/http'
import type {
  KeywordRule,
  KeywordRuleInput,
  OutOfHoursAutoReply,
  OutOfHoursSlot,
  WelcomeAutoReply,
} from '@/types/autoReplies'

function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function pickBoolean(record: Record<string, unknown>, keys: string[], fallback = false): boolean {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'boolean') {
      return value
    }
  }
  return fallback
}

function pickNumber(record: Record<string, unknown>, keys: string[], fallback: number): number {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
      return Number(value)
    }
  }
  return fallback
}

function pickString(record: Record<string, unknown>, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string') {
      return value
    }
  }
  return fallback
}

function unwrapPayload(raw: unknown): Record<string, unknown> | null {
  const top = asRecord(raw)
  if (!top) {
    return null
  }
  const nested = asRecord(top.data)
  if (nested) {
    return nested
  }
  for (const key of [
    'welcome_auto_reply',
    'welcome',
    'out_of_hours_auto_reply',
    'out_of_hours',
  ]) {
    const inner = asRecord(top[key])
    if (inner) {
      return inner
    }
  }
  return top
}

function normalizeWelcome(raw: unknown): WelcomeAutoReply {
  const record = unwrapPayload(raw) ?? {}
  return {
    enabled: pickBoolean(record, ['enabled', 'is_enabled']),
    message: pickString(record, ['message']),
    inactivity_hours: pickNumber(record, ['inactivity_hours', 'inactivity_hours_threshold'], 24),
  }
}

function normalizeSlot(raw: unknown, index: number): OutOfHoursSlot {
  const record = asRecord(raw) ?? {}
  return {
    day_of_week: pickNumber(record, ['day_of_week', 'day', 'weekday'], index),
    enabled: pickBoolean(record, ['enabled', 'is_enabled'], true),
    start_time: pickString(record, ['start_time', 'opens_at', 'start'], '09:00'),
    end_time: pickString(record, ['end_time', 'closes_at', 'end'], '18:00'),
  }
}

export function createDefaultOutOfHoursSlots(): OutOfHoursSlot[] {
  return Array.from({ length: 7 }, (_, day) => ({
    day_of_week: day,
    enabled: day >= 1 && day <= 5,
    start_time: '09:00',
    end_time: '18:00',
  }))
}

function normalizeOutOfHours(raw: unknown): OutOfHoursAutoReply {
  const record = unwrapPayload(raw) ?? {}
  const slotsRaw = record.slots
  const slots = Array.isArray(slotsRaw)
    ? slotsRaw.map((slot, index) => normalizeSlot(slot, index))
    : createDefaultOutOfHoursSlots()

  const byDay = new Map(slots.map((slot) => [slot.day_of_week, slot]))
  const orderedSlots = Array.from({ length: 7 }, (_, day) => {
    return (
      byDay.get(day) ?? {
        day_of_week: day,
        enabled: false,
        start_time: '09:00',
        end_time: '18:00',
      }
    )
  })

  return {
    enabled: pickBoolean(record, ['enabled', 'is_enabled']),
    timezone: pickString(record, ['timezone'], 'America/Sao_Paulo'),
    message: pickString(record, ['message']),
    cooldown_minutes: pickNumber(record, ['cooldown_minutes'], 60),
    slots: orderedSlots,
  }
}

function normalizeKeywordRule(raw: unknown): KeywordRule | null {
  const record = asRecord(raw)
  if (!record) {
    return null
  }
  const id = pickNumber(record, ['id'], NaN)
  if (!Number.isFinite(id)) {
    return null
  }
  const matchType = pickString(record, ['match_type', 'match'])
  const normalizedMatch = matchType === 'exact' || matchType === 'contains' ? matchType : 'contains'

  return {
    id,
    keyword: pickString(record, ['keyword', 'trigger']),
    message: pickString(record, ['message', 'reply_message', 'reply']),
    match_type: normalizedMatch,
    priority: pickNumber(record, ['priority'], 0),
    is_active: pickBoolean(record, ['is_active', 'active'], true),
  }
}

function extractKeywordRules(raw: unknown): KeywordRule[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeKeywordRule).filter((rule): rule is KeywordRule => rule != null)
  }
  const top = asRecord(raw)
  if (!top) {
    return []
  }
  const candidates = [top.data, top.keyword_rules, top.rules]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map(normalizeKeywordRule).filter((rule): rule is KeywordRule => rule != null)
    }
  }
  return []
}

function serializeWelcome(payload: WelcomeAutoReply): Record<string, unknown> {
  return {
    enabled: payload.enabled,
    message: payload.message,
    inactivity_hours: payload.inactivity_hours,
  }
}

function serializeOutOfHours(payload: OutOfHoursAutoReply): Record<string, unknown> {
  return {
    enabled: payload.enabled,
    timezone: payload.timezone,
    message: payload.message,
    cooldown_minutes: payload.cooldown_minutes,
    slots: payload.slots.map((slot) => ({
      day_of_week: slot.day_of_week,
      enabled: slot.enabled,
      start_time: slot.start_time,
      end_time: slot.end_time,
    })),
  }
}

function serializeKeywordRuleInput(payload: KeywordRuleInput): Record<string, unknown> {
  return {
    keyword: payload.keyword,
    message: payload.message,
    match_type: payload.match_type,
    priority: payload.priority,
    is_active: payload.is_active,
  }
}

export async function fetchWelcomeAutoReply(): Promise<WelcomeAutoReply> {
  const { data } = await http.get('/api/auto-replies/welcome')
  return normalizeWelcome(data)
}

export async function updateWelcomeAutoReply(payload: WelcomeAutoReply): Promise<WelcomeAutoReply> {
  const { data } = await http.put('/api/auto-replies/welcome', serializeWelcome(payload))
  return normalizeWelcome(data)
}

export async function fetchOutOfHoursAutoReply(): Promise<OutOfHoursAutoReply> {
  const { data } = await http.get('/api/auto-replies/out-of-hours')
  return normalizeOutOfHours(data)
}

export async function updateOutOfHoursAutoReply(
  payload: OutOfHoursAutoReply,
): Promise<OutOfHoursAutoReply> {
  const { data } = await http.put('/api/auto-replies/out-of-hours', serializeOutOfHours(payload))
  return normalizeOutOfHours(data)
}

export async function fetchKeywordRules(): Promise<KeywordRule[]> {
  const { data } = await http.get('/api/auto-replies/keyword-rules')
  return extractKeywordRules(data).sort((a, b) => b.priority - a.priority || a.id - b.id)
}

export async function createKeywordRule(payload: KeywordRuleInput): Promise<KeywordRule> {
  const { data } = await http.post('/api/auto-replies/keyword-rules', serializeKeywordRuleInput(payload))
  const created = normalizeKeywordRule(asRecord(data)?.data ?? data)
  if (!created) {
    throw new Error('Resposta inválida ao criar regra.')
  }
  return created
}

export async function updateKeywordRule(
  id: number,
  payload: KeywordRuleInput,
): Promise<KeywordRule> {
  const { data } = await http.put(
    `/api/auto-replies/keyword-rules/${id}`,
    serializeKeywordRuleInput(payload),
  )
  const updated = normalizeKeywordRule(asRecord(data)?.data ?? data)
  if (!updated) {
    throw new Error('Resposta inválida ao atualizar regra.')
  }
  return updated
}

export async function deleteKeywordRule(id: number): Promise<void> {
  await http.delete(`/api/auto-replies/keyword-rules/${id}`)
}

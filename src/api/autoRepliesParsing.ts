import type { BusinessHourSlot, KeywordRule, OutOfHoursAutoReply } from '@/types/autoReplies'

export class AutoRepliesParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AutoRepliesParseError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function unwrapResourceData(payload: unknown): unknown {
  if (!isRecord(payload)) {
    return payload
  }
  if ('data' in payload) {
    return payload.data
  }
  return payload
}

export function parseKeywordRulesPayload(payload: unknown): KeywordRule[] {
  const unwrapped = unwrapResourceData(payload)

  if (unwrapped == null) {
    return []
  }

  if (!Array.isArray(unwrapped)) {
    throw new AutoRepliesParseError(
      'Resposta inválida de /api/auto-replies/keyword-rules: esperado array ou { data: array }.',
    )
  }

  return unwrapped as KeywordRule[]
}

export function parseKeywordRulePayload(payload: unknown): KeywordRule {
  const unwrapped = unwrapResourceData(payload)

  if (!isRecord(unwrapped) || typeof unwrapped.id !== 'number') {
    throw new AutoRepliesParseError(
      'Resposta inválida ao salvar regra de palavra-chave: objeto com id numérico esperado.',
    )
  }

  return unwrapped as unknown as KeywordRule
}

function parseBusinessHours(value: unknown): BusinessHourSlot[] {
  if (value == null) {
    return []
  }
  if (!Array.isArray(value)) {
    throw new AutoRepliesParseError(
      'Resposta inválida de /api/auto-replies/out-of-hours: business_hours deve ser uma lista.',
    )
  }
  return value as BusinessHourSlot[]
}

export function orderBusinessHours(slots: BusinessHourSlot[]): BusinessHourSlot[] {
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

export function parseOutOfHoursPayload(payload: unknown): OutOfHoursAutoReply {
  const unwrapped = unwrapResourceData(payload)

  if (!isRecord(unwrapped)) {
    throw new AutoRepliesParseError(
      'Resposta inválida de /api/auto-replies/out-of-hours: esperado objeto ou { data: objeto }.',
    )
  }

  const business_hours = parseBusinessHours(unwrapped.business_hours)

  return {
    enabled: Boolean(unwrapped.enabled),
    timezone:
      typeof unwrapped.timezone === 'string' ? unwrapped.timezone : 'America/Sao_Paulo',
    message: typeof unwrapped.message === 'string' ? unwrapped.message : null,
    cooldown_minutes:
      typeof unwrapped.cooldown_minutes === 'number' ? unwrapped.cooldown_minutes : 60,
    business_hours: orderBusinessHours(business_hours),
    updated_at: typeof unwrapped.updated_at === 'string' ? unwrapped.updated_at : null,
  }
}

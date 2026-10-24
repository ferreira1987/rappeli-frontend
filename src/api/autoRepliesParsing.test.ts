import { describe, expect, it } from 'vitest'

import {
  AutoRepliesParseError,
  parseKeywordRulePayload,
  parseKeywordRulesPayload,
  parseOutOfHoursPayload,
} from '@/api/autoRepliesParsing'

describe('parseKeywordRulesPayload', () => {
  const rule = {
    id: 1,
    keyword: 'preço',
    match_type: 'contains' as const,
    response_body: 'Olá',
    is_active: true,
    priority: 10,
    created_at: '2026-10-24T12:00:00+00:00',
    updated_at: '2026-10-24T12:00:00+00:00',
  }

  it('accepts a bare array (documented shape)', () => {
    expect(parseKeywordRulesPayload([rule])).toEqual([rule])
  })

  it('accepts Laravel JsonResource wrapper { data: [...] }', () => {
    expect(parseKeywordRulesPayload({ data: [rule] })).toEqual([rule])
  })

  it('returns empty array for null', () => {
    expect(parseKeywordRulesPayload(null)).toEqual([])
  })

  it('returns empty array for { data: null }', () => {
    expect(parseKeywordRulesPayload({ data: null })).toEqual([])
  })

  it('throws when data is not an array', () => {
    expect(() => parseKeywordRulesPayload({ data: { id: 1 } })).toThrow(AutoRepliesParseError)
    expect(() => parseKeywordRulesPayload({ ok: true })).toThrow(AutoRepliesParseError)
  })
})

describe('parseKeywordRulePayload', () => {
  const rule = {
    id: 2,
    keyword: 'catálogo',
    match_type: 'exact' as const,
    response_body: 'Link',
    is_active: true,
    priority: 100,
    created_at: '2026-10-24T12:00:00+00:00',
    updated_at: '2026-10-24T12:00:00+00:00',
  }

  it('unwraps { data: rule } on create/update', () => {
    expect(parseKeywordRulePayload({ data: rule })).toEqual(rule)
  })

  it('accepts bare rule object', () => {
    expect(parseKeywordRulePayload(rule)).toEqual(rule)
  })
})

describe('parseOutOfHoursPayload', () => {
  it('unwraps { data: settings }', () => {
    const parsed = parseOutOfHoursPayload({
      data: {
        enabled: true,
        timezone: 'America/Sao_Paulo',
        message: 'Fora',
        cooldown_minutes: 60,
        business_hours: [{ day_of_week: 1, is_closed: false, opens_at: '09:00', closes_at: '18:00' }],
        updated_at: null,
      },
    })

    expect(parsed.enabled).toBe(true)
    expect(parsed.business_hours).toHaveLength(7)
    expect(parsed.business_hours[1]?.opens_at).toBe('09:00')
  })

  it('treats missing business_hours as empty list', () => {
    const parsed = parseOutOfHoursPayload({
      data: {
        enabled: false,
        timezone: 'America/Sao_Paulo',
        message: null,
        cooldown_minutes: 60,
        updated_at: null,
      },
    })
    expect(parsed.business_hours).toHaveLength(7)
  })

  it('throws when business_hours is not an array', () => {
    expect(() =>
      parseOutOfHoursPayload({
        data: {
          enabled: false,
          timezone: 'America/Sao_Paulo',
          message: null,
          cooldown_minutes: 60,
          business_hours: {},
          updated_at: null,
        },
      }),
    ).toThrow(AutoRepliesParseError)
  })
})

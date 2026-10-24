import { describe, expect, it } from 'vitest'

import { filterCountsFromApi, inboxFilterFromTab } from '@/utils/conversationFilters'

describe('inboxFilterFromTab', () => {
  it('maps automation tab to automated API filter', () => {
    expect(inboxFilterFromTab('automation')).toBe('automated')
  })

  it('passes through other tab ids', () => {
    expect(inboxFilterFromTab('all')).toBe('all')
    expect(inboxFilterFromTab('unread')).toBe('unread')
    expect(inboxFilterFromTab('human')).toBe('human')
  })
})

describe('filterCountsFromApi', () => {
  it('maps automated count to automation tab key', () => {
    expect(
      filterCountsFromApi({ all: 10, unread: 2, automated: 3, human: 5 }),
    ).toEqual({
      all: 10,
      unread: 2,
      automation: 3,
      human: 5,
    })
  })
})

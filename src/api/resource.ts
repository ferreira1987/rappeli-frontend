import type { PaginationMeta } from '@/types/conversations'

export function unwrapData<T>(payload: unknown): T {
  if (payload !== null && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

type LaravelMeta = {
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
}

export function parsePaginatedResource<T>(payload: unknown): { items: T[]; meta: PaginationMeta } {
  const body = payload as { data?: T[]; meta?: LaravelMeta }
  const items = Array.isArray(body?.data) ? body.data : []
  const meta = body.meta
  return {
    items,
    meta: {
      current_page: meta?.current_page ?? 1,
      last_page: meta?.last_page ?? 1,
      per_page: meta?.per_page ?? items.length,
      total: meta?.total ?? items.length,
    },
  }
}

export function parseResourceCollection<T>(payload: unknown): T[] {
  const data = unwrapData<unknown>(payload)
  return Array.isArray(data) ? data : []
}

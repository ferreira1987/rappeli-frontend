import { http } from '@/api/http'
import { parsePaginatedResource, unwrapData } from '@/api/resource'
import type {
  Contact,
  ContactImportResult,
  StoreContactPayload,
} from '@/types/contacts'
import type { PaginationMeta } from '@/types/conversations'

export type FetchContactsParams = {
  search?: string
  per_page?: number
  page?: number
}

export async function fetchContacts(
  params: FetchContactsParams = {},
): Promise<{ contacts: Contact[]; meta: PaginationMeta }> {
  const { data } = await http.get<unknown>('/api/contacts', {
    params: {
      per_page: params.per_page ?? 50,
      page: params.page ?? 1,
      ...(params.search ? { search: params.search } : {}),
    },
  })
  const parsed = parsePaginatedResource<Contact>(data)
  return { contacts: parsed.items, meta: parsed.meta }
}

export async function createContact(payload: StoreContactPayload): Promise<Contact> {
  const { data } = await http.post<unknown>('/api/contacts', payload)
  return unwrapData<Contact>(data)
}

export async function importContactsCsv(file: File): Promise<ContactImportResult> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await http.post<unknown>('/api/contacts/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrapData<ContactImportResult>(data)
}

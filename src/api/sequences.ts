import { http } from '@/api/http'
import { parseResourceCollection, unwrapData } from '@/api/resource'
import type { Sequence, SequenceStep } from '@/types/campaigns'

export async function fetchSequences(): Promise<Sequence[]> {
  const { data } = await http.get<unknown>('/api/sequences')
  return parseResourceCollection<Sequence>(data)
}

export async function fetchSequence(id: number): Promise<Sequence> {
  const list = await fetchSequences()
  const found = list.find((s) => s.id === id)
  if (!found) {
    throw new Error('Sequência não encontrada.')
  }
  return found
}

export async function createSequence(payload: {
  name: string
  description?: string | null
  active?: boolean
}): Promise<Sequence> {
  const { data } = await http.post<unknown>('/api/sequences', payload)
  return unwrapData<Sequence>(data)
}

export async function updateSequence(
  id: number,
  payload: Partial<Record<string, unknown>>,
): Promise<Sequence> {
  const { data } = await http.patch<unknown>(`/api/sequences/${id}`, payload)
  return unwrapData<Sequence>(data)
}

export async function deleteSequence(id: number): Promise<void> {
  await http.delete(`/api/sequences/${id}`)
}

export async function createSequenceStep(
  sequenceId: number,
  payload: Record<string, unknown>,
): Promise<SequenceStep> {
  const { data } = await http.post<unknown>(`/api/sequences/${sequenceId}/steps`, payload)
  return unwrapData<SequenceStep>(data)
}

export async function enrollSequence(sequenceId: number, contactIds: number[]): Promise<number> {
  const { data } = await http.post<unknown>(`/api/sequences/${sequenceId}/enroll`, {
    contact_ids: contactIds,
  })
  const result = unwrapData<{ enrolled: number }>(data)
  return result.enrolled
}

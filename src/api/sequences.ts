import { http } from '@/api/http'
import { parseResourceCollection, unwrapData } from '@/api/resource'
import type { Sequence, SequenceStep } from '@/types/campaigns'

export async function fetchSequences(): Promise<Sequence[]> {
  const { data } = await http.get<unknown>('/api/sequences')
  return parseResourceCollection<Sequence>(data)
}

export function findSequenceInList(sequences: Sequence[], id: number): Sequence | undefined {
  return sequences.find((s) => s.id === id)
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
  payload: {
    position?: number
    kind: 'message' | 'wait' | 'condition'
    label?: string | null
    message_template_id?: number | null
    preview?: string | null
    wait_minutes?: number | null
    condition_config?: Record<string, unknown> | null
  },
): Promise<SequenceStep> {
  const { data } = await http.post<unknown>(`/api/sequences/${sequenceId}/steps`, payload)
  return unwrapData<SequenceStep>(data)
}

export async function updateSequenceStep(
  sequenceId: number,
  stepId: number,
  payload: Partial<{
    position: number
    kind: 'message' | 'wait' | 'condition'
    label: string | null
    message_template_id: number | null
    preview: string | null
    wait_minutes: number | null
    condition_config: Record<string, unknown> | null
  }>,
): Promise<SequenceStep> {
  const { data } = await http.patch<unknown>(`/api/sequences/${sequenceId}/steps/${stepId}`, payload)
  return unwrapData<SequenceStep>(data)
}

export async function deleteSequenceStep(sequenceId: number, stepId: number): Promise<void> {
  await http.delete(`/api/sequences/${sequenceId}/steps/${stepId}`)
}

export async function reorderSequenceSteps(sequenceId: number, stepIds: number[]): Promise<void> {
  await http.patch(`/api/sequences/${sequenceId}/steps/reorder`, { step_ids: stepIds })
}

export async function enrollSequence(sequenceId: number, contactIds: number[]): Promise<number> {
  const { data } = await http.post<unknown>(`/api/sequences/${sequenceId}/enroll`, {
    contact_ids: contactIds,
  })
  const result = unwrapData<{ enrolled: number }>(data)
  return result.enrolled
}

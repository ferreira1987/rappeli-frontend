const VARIABLE_PATTERN = /\{\{(\d+)\}\}/g

/** Rótulo Meta `{{n}}` para exibir em templates Vue sem conflito com mustache. */
export function formatMetaTemplateVariable(index: number): string {
  return `{{${index}}}`
}

export const META_TEMPLATE_VARIABLE_EXAMPLES = ['{{1}}', '{{2}}'] as const

export function extractTemplateVariableIndexes(body: string | null | undefined): number[] {
  if (!body) {
    return []
  }

  const indexes = new Set<number>()
  for (const match of body.matchAll(VARIABLE_PATTERN)) {
    const index = Number(match[1])
    if (Number.isFinite(index) && index > 0) {
      indexes.add(index)
    }
  }

  return [...indexes].sort((a, b) => a - b)
}

export function resolveTemplateVariableIndexes(
  variables: number[] | null | undefined,
  body: string | null | undefined,
): number[] {
  if (variables?.length) {
    return [...variables].sort((a, b) => a - b)
  }
  return extractTemplateVariableIndexes(body)
}

export function applyTemplateBodyParameters(body: string, parameters: string[]): string {
  return body.replace(VARIABLE_PATTERN, (match, indexStr) => {
    const index = Number(indexStr) - 1
    if (!Number.isFinite(index) || index < 0) {
      return match
    }
    const value = parameters[index]?.trim()
    return value ? value : match
  })
}

export function isMessageTemplateApproved(template: {
  approved: boolean
  status?: string | null
}): boolean {
  if (template.approved) {
    return true
  }
  return String(template.status ?? '').toUpperCase() === 'APPROVED'
}

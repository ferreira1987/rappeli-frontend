export type ReportStatusSegment = {
  key: 'resolved' | 'in_progress' | 'unassigned'
  label: string
  count: number
  percent: number
  barClass: string
}

export function buildReportStatusSegments(input: {
  conversations_resolved?: number
  conversations_open?: number
  conversations_open_unassigned?: number
}): ReportStatusSegment[] {
  const resolved = input.conversations_resolved ?? 0
  const open = input.conversations_open ?? 0
  const unassigned = input.conversations_open_unassigned ?? 0
  const inProgress = Math.max(open - unassigned, 0)
  const total = resolved + open

  function percent(count: number): number {
    if (total <= 0) {
      return 0
    }
    return Math.round((count / total) * 100)
  }

  return [
    {
      key: 'resolved',
      label: 'Finalizadas com sucesso',
      count: resolved,
      percent: percent(resolved),
      barClass: 'bg-emerald-500',
    },
    {
      key: 'in_progress',
      label: 'Em andamento na fila',
      count: inProgress,
      percent: percent(inProgress),
      barClass: 'bg-brand-indigo',
    },
    {
      key: 'unassigned',
      label: 'Não atribuídas / Triagem',
      count: unassigned,
      percent: percent(unassigned),
      barClass: 'bg-amber-500',
    },
  ]
}

export function resolutionEfficiencyLabel(handled: number, resolved: number): string | null {
  if (handled <= 0) {
    return null
  }
  const pct = (resolved / handled) * 100
  const formatted = pct.toFixed(1).replace('.', ',')
  let tier = 'Em evolução'
  if (pct >= 90) {
    tier = 'Excelente'
  } else if (pct >= 75) {
    tier = 'Boa'
  } else if (pct >= 50) {
    tier = 'Regular'
  }
  return `${tier} (${formatted}%)`
}

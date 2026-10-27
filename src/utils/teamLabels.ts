import type { TeamAgent, TeamAgentRole } from '@/types/team'

export const roleLabels: Record<TeamAgentRole, string> = {
  atendente: 'Atendente',
  supervisor: 'Supervisor',
  administrador: 'Administrador',
}

function nameCount<T extends { name: string }>(items: T[], name: string): number {
  return items.filter((item) => item.name === name).length
}

/** Label for selects/lists when several people share the same display name. */
export function formatAgentDisplayName(
  agent: Pick<TeamAgent, 'name' | 'email'>,
  allAgents: Pick<TeamAgent, 'name' | 'email'>[],
): string {
  if (nameCount(allAgents, agent.name) > 1) {
    return `${agent.name} (${agent.email})`
  }
  return agent.name
}

export function formatReportAgentDisplayName(
  row: { user_id: number; name: string; email?: string | null },
  allRows: { user_id: number; name: string; email?: string | null }[],
): string {
  if (row.email && nameCount(allRows, row.name) > 1) {
    return `${row.name} (${row.email})`
  }
  if (nameCount(allRows, row.name) > 1) {
    return `${row.name} (#${row.user_id})`
  }
  return row.name
}

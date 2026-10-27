/** Dados de exemplo — substituir por API quando disponível. */

import { buildCampaignPerformanceFromCampaigns, exampleCampaigns } from '@/mocks/campaignBuilder'
import { EXAMPLE_AVERAGE_RESPONSE_TIME_LABEL } from '@/mocks/sharedExampleMetrics'

export type AgentPerformanceRow = {
  id: string
  name: string
  sector: string
  sectorTone: 'blue' | 'green' | 'red'
  handled: number
  firstResponse: string
  resolutionTime: string
  resolved: number
  open: number
  efficiency: number
  isCurrentUser?: boolean
}

export const exampleAgentPerformance: AgentPerformanceRow[] = [
  {
    id: 'mariana',
    name: 'Mariana Costa',
    sector: 'Recepção (Padrão)',
    sectorTone: 'blue',
    handled: 42,
    firstResponse: '01m 55s',
    resolutionTime: '18m',
    resolved: 36,
    open: 4,
    efficiency: 85,
  },
  {
    id: 'roberto',
    name: 'Roberto Silva',
    sector: 'Financeiro',
    sectorTone: 'green',
    handled: 28,
    firstResponse: '03m 10s',
    resolutionTime: '22m',
    resolved: 22,
    open: 3,
    efficiency: 78,
  },
  {
    id: 'carlos',
    name: 'Carlos Eduardo',
    sector: 'Recepção (Padrão)',
    sectorTone: 'blue',
    handled: 26,
    firstResponse: '02m 45s',
    resolutionTime: '20m',
    resolved: 19,
    open: 5,
    efficiency: 73,
  },
  {
    id: 'fernanda',
    name: 'Dra. Fernanda Lins',
    sector: 'Clínico',
    sectorTone: 'red',
    handled: 18,
    firstResponse: '04m 05s',
    resolutionTime: '28m',
    resolved: 12,
    open: 4,
    efficiency: 66,
  },
  {
    id: 'adao',
    name: 'Adão Ferreira',
    sector: 'Recepção (Padrão)',
    sectorTone: 'blue',
    handled: 14,
    firstResponse: '03m 30s',
    resolutionTime: '25m',
    resolved: 8,
    open: 15,
    efficiency: 57,
    isCurrentUser: true,
  },
]

function sumAgentMetric(key: 'handled' | 'resolved' | 'open'): number {
  return exampleAgentPerformance.reduce((total, row) => total + row[key], 0)
}

const conversationsHandled = sumAgentMetric('handled')
const conversationsResolved = sumAgentMetric('resolved')
const conversationsOpen = sumAgentMetric('open')

export const exampleReportKpis = {
  avgFirstResponse: EXAMPLE_AVERAGE_RESPONSE_TIME_LABEL,
  conversationsHandled,
  handledDelta: 'Soma das conversas atendidas na tabela abaixo',
  resolved: conversationsResolved,
  resolutionRate:
    conversationsHandled > 0
      ? `${((conversationsResolved / conversationsHandled) * 100).toFixed(1).replace('.', ',')}%`
      : '0%',
  open: conversationsOpen,
}

export const exampleCampaignPerformance = buildCampaignPerformanceFromCampaigns(exampleCampaigns)

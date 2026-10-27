/** Dados de exemplo — substituir por API quando disponível. */

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

export const exampleReportKpis = {
  avgFirstResponse: '02m 40s',
  conversationsHandled: 128,
  handledDelta: '+12 vs semana anterior',
  resolved: 97,
  resolutionRate: '75,8%',
  open: 31,
}

export const exampleAgentPerformance: AgentPerformanceRow[] = [
  {
    id: 'mariana',
    name: 'Mariana Costa',
    sector: 'Recepção',
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
    sector: 'Recepção',
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
    sector: 'Recepção',
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

export const exampleCampaignPerformance = [
  {
    name: 'Lembrete retorno 6 meses',
    sent: 310,
    delivered: 305,
    readRate: '64%',
  },
  {
    name: 'Retorno preventivo odonto',
    sent: 198,
    delivered: 195,
    readRate: '58%',
  },
]

/** Dados de exemplo — substituir por API quando disponível. */

import { EXAMPLE_CAMPAIGN_SEGMENT_CONTACTS } from '@/mocks/sharedExampleMetrics'

export type CampaignStatus = 'enviando' | 'agendada' | 'concluida' | 'rascunho'

export const exampleCampaignSegmentContactCount = EXAMPLE_CAMPAIGN_SEGMENT_CONTACTS

export type ExampleCampaign = {
  id: string
  name: string
  description: string
  segmentTags: string[]
  templateName: string
  templateApproved: boolean
  scheduleLabel: string
  status: CampaignStatus
  sent: number
  delivered: number
  read: number
}

export type ExampleSequence = {
  id: string
  name: string
  description: string
  steps: number
  contactsInProgress: number
  active: boolean
}

export type MetaTemplate = {
  id: string
  name: string
  category: string
  locale: string
  approved: boolean
  body: string
  footer?: string
  marketing?: boolean
}

export const exampleSequences: ExampleSequence[] = [
  {
    id: 'seq1',
    name: 'Reativação de Pacientes Ausentes (90 dias)',
    description:
      'Série com 3 etapas: checagem de saúde bucal, convite de retorno preventivo e aviso de horários disponíveis.',
    steps: 3,
    contactsInProgress: 84,
    active: true,
  },
  {
    id: 'seq2',
    name: 'Boas-Vindas e Cuidados Pós-Primeira Consulta',
    description:
      'Série com 2 etapas: agradecimento da visita com cartão digital da clínica e pesquisa breve de atendimento após 24h.',
    steps: 2,
    contactsInProgress: 41,
    active: true,
  },
]

export const exampleMetaTemplates: MetaTemplate[] = [
  {
    id: 't1',
    name: 'lembrete_retorno',
    category: 'Utilidade',
    locale: 'pt_BR',
    approved: true,
    body:
      'Olá, {{nome}}! Identificamos que já faz 6 meses desde o seu último procedimento de {{procedimento}}. Que tal agendar sua consulta preventiva com a {{profissional}}?',
    footer: "Botão interativo: 'Confirmar consulta' • 3 variáveis mapeadas",
  },
  {
    id: 't2',
    name: 'aviso_horario_disponivel',
    category: 'Utilidade',
    locale: 'pt_BR',
    approved: true,
    body: 'Temos novos horários disponíveis para {{nome}}. Gostaria de agendar?',
  },
  {
    id: 't3',
    name: 'novidades_harmonizacao',
    category: 'Marketing',
    locale: 'pt_BR',
    approved: true,
    body: 'Confira as novidades em harmonização facial na nossa clínica.',
    marketing: true,
  },
]

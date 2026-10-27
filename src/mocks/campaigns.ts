/** Dados de exemplo — substituir por API quando disponível. */

export type CampaignStatus = 'enviando' | 'agendada' | 'concluida' | 'rascunho'

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

export const exampleCampaigns: ExampleCampaign[] = [
  {
    id: 'c1',
    name: 'Lembrete retorno 6 meses',
    description: 'Pacientes com última limpeza há mais de 180 dias.',
    segmentTags: ['Tag: Retorno 6 meses', 'Tag: Limpeza'],
    templateName: 'lembrete_retorno',
    templateApproved: true,
    scheduleLabel: 'Hoje, 14:00 · 25 Out 2026',
    status: 'enviando',
    sent: 142,
    delivered: 138,
    read: 91,
  },
  {
    id: 'c2',
    name: 'Harmonização — horários disponíveis',
    description: 'Convite para avaliação de harmonização facial.',
    segmentTags: ['Tag: Harmonização & Estética'],
    templateName: 'aviso_horario_disponivel',
    templateApproved: true,
    scheduleLabel: '28/10/2026 às 10:00',
    status: 'agendada',
    sent: 0,
    delivered: 0,
    read: 0,
  },
  {
    id: 'c3',
    name: 'Aviso recesso fim de ano',
    description: 'Comunicado institucional e plantão clínico.',
    segmentTags: ['Todos os contatos opt-in'],
    templateName: 'aviso_institucional_v1',
    templateApproved: true,
    scheduleLabel: 'Não agendado',
    status: 'rascunho',
    sent: 0,
    delivered: 0,
    read: 0,
  },
  {
    id: 'c4',
    name: 'Retorno preventivo odonto',
    description: 'Lembrete de avaliação odontológica semestral.',
    segmentTags: ['Tag: Avaliação Odonto'],
    templateName: 'retorno_preventivo_v2',
    templateApproved: true,
    scheduleLabel: '20/10/2026 às 09:30',
    status: 'concluida',
    sent: 310,
    delivered: 305,
    read: 198,
  },
  {
    id: 'c5',
    name: 'Novidades harmonização',
    description: 'Campanha informativa sobre novos protocolos.',
    segmentTags: ['Tag: Harmonização & Estética'],
    templateName: 'novidades_harmonizacao',
    templateApproved: true,
    scheduleLabel: '15/10/2026 às 15:00',
    status: 'concluida',
    sent: 88,
    delivered: 86,
    read: 52,
  },
  {
    id: 'c6',
    name: 'Confirmação de consulta em massa',
    description: 'Disparo de confirmação para agenda da semana.',
    segmentTags: ['Tag: Consulta agendada'],
    templateName: 'confirmacao_consulta',
    templateApproved: true,
    scheduleLabel: '26/10/2026 às 08:00',
    status: 'agendada',
    sent: 0,
    delivered: 0,
    read: 0,
  },
]

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
      'Olá, {{1}}! Identificamos que já faz 6 meses desde o seu último procedimento de {{2}}. Que tal agendar sua consulta preventiva com a {{3}}?',
    footer: "Botão interativo: 'Confirmar consulta' • 3 variáveis mapeadas",
  },
  {
    id: 't2',
    name: 'aviso_horario_disponivel',
    category: 'Utilidade',
    locale: 'pt_BR',
    approved: true,
    body: 'Temos novos horários disponíveis para {{1}}. Gostaria de agendar?',
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

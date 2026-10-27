/** Dados de exemplo — substituir por API quando disponível. */

export type FunnelStageId = 'novo' | 'agendamento' | 'confirmado' | 'retorno'

export type FunnelCard = {
  id: string
  stageId: FunnelStageId
  contactName: string
  phone: string
  lastMessage: string
  relativeTime: string
  tags: { label: string; tone: 'purple' | 'gray' | 'green' | 'blue' }[]
  assigneeInitials: string
  assigneeShortName: string
  scheduledBanner?: string
  moving?: boolean
}

export type FunnelStage = {
  id: FunnelStageId
  title: string
  color: string
  dotClass: string
}

export const funnelStages: FunnelStage[] = [
  { id: 'novo', title: 'Novo contato', color: 'blue', dotClass: 'bg-blue-500' },
  { id: 'agendamento', title: 'Agendamento', color: 'orange', dotClass: 'bg-amber-500' },
  { id: 'confirmado', title: 'Confirmado', color: 'green', dotClass: 'bg-emerald-500' },
  { id: 'retorno', title: 'Retorno', color: 'purple', dotClass: 'bg-violet-500' },
]

export const exampleFunnelCards: FunnelCard[] = [
  {
    id: '1',
    stageId: 'novo',
    contactName: 'Mariana Costa',
    phone: '+55 62 98412-3301',
    lastMessage: 'Gostaria de agendar uma avaliação estética para esta semana.',
    relativeTime: 'há 12 min',
    tags: [
      { label: 'Avaliação', tone: 'purple' },
      { label: 'Origem: Instagram', tone: 'gray' },
    ],
    assigneeInitials: 'AF',
    assigneeShortName: 'Adão F.',
  },
  {
    id: '2',
    stageId: 'novo',
    contactName: 'Roberto Silva',
    phone: '+55 62 99188-2200',
    lastMessage: 'Qual valor da consulta com dermatologista?',
    relativeTime: 'há 28 min',
    tags: [{ label: 'Recepção', tone: 'blue' }],
    assigneeInitials: 'MC',
    assigneeShortName: 'Mariana C.',
  },
  {
    id: '3',
    stageId: 'agendamento',
    contactName: 'Carlos Eduardo',
    phone: '+55 62 99655-1200',
    lastMessage: 'Pode ser na terça às 14h?',
    relativeTime: 'há 1 h',
    tags: [{ label: 'Agendamento', tone: 'purple' }],
    assigneeInitials: 'AF',
    assigneeShortName: 'Adão F.',
    scheduledBanner: 'Mensagem agendada 28/10 às 09:00',
  },
  {
    id: '4',
    stageId: 'agendamento',
    contactName: 'Dra. Fernanda Lins',
    phone: '+55 62 99330-7722',
    lastMessage: 'Confirmo retorno do paciente João na sexta.',
    relativeTime: 'há 2 h',
    tags: [{ label: 'Clínico', tone: 'green' }],
    assigneeInitials: 'RS',
    assigneeShortName: 'Roberto S.',
    moving: true,
  },
  {
    id: '5',
    stageId: 'confirmado',
    contactName: 'Ana Paula M.',
    phone: '+55 62 98765-4321',
    lastMessage: 'Confirmado pelo WhatsApp.',
    relativeTime: 'ontem',
    tags: [
      { label: 'Consulta', tone: 'blue' },
      { label: 'Confirmado WhatsApp', tone: 'green' },
    ],
    assigneeInitials: 'MC',
    assigneeShortName: 'Mariana C.',
  },
  {
    id: '6',
    stageId: 'retorno',
    contactName: 'Lucas Ferreira',
    phone: '+55 62 98111-9090',
    lastMessage: 'Lembrete de retorno preventivo enviado.',
    relativeTime: 'há 3 dias',
    tags: [
      { label: 'Retorno preventivo', tone: 'purple' },
      { label: 'Revisão', tone: 'gray' },
    ],
    assigneeInitials: 'CE',
    assigneeShortName: 'Carlos E.',
  },
]

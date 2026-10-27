import type { CampaignStatus, ExampleCampaign } from '@/mocks/campaigns'
import {
  formatCampaignScheduleLabel,
  isoDateFromOffset,
  parseScheduleDateTime,
} from '@/utils/scheduleRelative'

type CampaignSeed = Omit<
  ExampleCampaign,
  'scheduleLabel' | 'status'
> & {
  dayOffset: number
  scheduleTime: string
  status?: CampaignStatus
}

const CAMPAIGN_SEEDS: CampaignSeed[] = [
  {
    id: 'c1',
    name: 'Lembrete retorno 6 meses',
    description: 'Pacientes com última limpeza há mais de 180 dias.',
    segmentTags: ['Tag: Retorno 6 meses', 'Tag: Limpeza'],
    templateName: 'lembrete_retorno',
    templateApproved: true,
    dayOffset: 0,
    scheduleTime: '14:00',
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
    dayOffset: 1,
    scheduleTime: '10:00',
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
    dayOffset: 30,
    scheduleTime: '09:00',
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
    dayOffset: -14,
    scheduleTime: '09:30',
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
    dayOffset: -21,
    scheduleTime: '15:00',
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
    dayOffset: -1,
    scheduleTime: '08:00',
    sent: 0,
    delivered: 0,
    read: 0,
  },
]

function deriveCampaignStatus(
  seed: CampaignSeed,
  scheduleAt: Date,
  reference: Date,
): CampaignStatus {
  if (seed.status === 'rascunho') {
    return 'rascunho'
  }
  if (seed.status === 'enviando') {
    return 'enviando'
  }
  if (scheduleAt.getTime() > reference.getTime()) {
    return 'agendada'
  }
  if (seed.sent > 0) {
    return 'concluida'
  }
  return 'concluida'
}

export function buildExampleCampaigns(referenceDate = new Date()): ExampleCampaign[] {
  return CAMPAIGN_SEEDS.map((seed) => {
    if (seed.status === 'rascunho') {
      return {
        id: seed.id,
        name: seed.name,
        description: seed.description,
        segmentTags: seed.segmentTags,
        templateName: seed.templateName,
        templateApproved: seed.templateApproved,
        scheduleLabel: 'Não agendado',
        status: 'rascunho',
        sent: seed.sent,
        delivered: seed.delivered,
        read: seed.read,
      }
    }

    const isoDate = isoDateFromOffset(seed.dayOffset, referenceDate)
    const scheduleLabel = formatCampaignScheduleLabel(isoDate, seed.scheduleTime)
    const scheduleAt = parseScheduleDateTime(isoDate, seed.scheduleTime)
    const status = deriveCampaignStatus(seed, scheduleAt, referenceDate)

    return {
      id: seed.id,
      name: seed.name,
      description: seed.description,
      segmentTags: seed.segmentTags,
      templateName: seed.templateName,
      templateApproved: seed.templateApproved,
      scheduleLabel,
      status,
      sent: seed.sent,
      delivered: seed.delivered,
      read: seed.read,
    }
  })
}

export type CampaignPerformanceRow = {
  name: string
  sent: number
  delivered: number
  readRate: string
}

export function buildCampaignPerformanceFromCampaigns(
  campaigns: ExampleCampaign[],
): CampaignPerformanceRow[] {
  return campaigns
    .filter((campaign) => campaign.sent > 0)
    .map((campaign) => ({
      name: campaign.name,
      sent: campaign.sent,
      delivered: campaign.delivered,
      readRate:
        campaign.delivered > 0
          ? `${Math.round((campaign.read / campaign.delivered) * 100)}%`
          : '0%',
    }))
}

export const exampleCampaigns = buildExampleCampaigns()

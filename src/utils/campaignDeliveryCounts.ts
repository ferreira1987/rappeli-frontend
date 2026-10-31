import type { Campaign, CampaignStatus } from '@/types/campaigns'

export type CampaignDeliveryCounts = {
  sent_count: number
  delivered_count: number
  read_count: number
  failed_count?: number
}

export function formatCampaignDeliverySummary(campaign: CampaignDeliveryCounts): string {
  const failed = campaign.failed_count ?? 0
  return `${campaign.sent_count} enviadas · ${campaign.delivered_count} entregues · ${campaign.read_count} lidas · ${failed} falhas`
}

function formatScheduledEnvioLabel(scheduledAt: string | null | undefined): string {
  if (!scheduledAt) {
    return 'Agendada'
  }
  const date = new Date(scheduledAt)
  if (Number.isNaN(date.getTime())) {
    return 'Agendada'
  }
  const formatted = date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  return `Agendada para ${formatted}`
}

/** Secondary line under campaign name in list views (Stitch v5). */
export function formatCampaignListEnvioLine(campaign: Pick<Campaign, 'status' | 'sent_count' | 'scheduled_at'>): string {
  const envioByStatus: Record<CampaignStatus, string> = {
    concluida: `${campaign.sent_count} enviados`,
    rascunho: `${campaign.sent_count} disparos`,
    agendada: formatScheduledEnvioLabel(campaign.scheduled_at),
    enviando: 'Enviando para contatos',
  }
  return envioByStatus[campaign.status]
}

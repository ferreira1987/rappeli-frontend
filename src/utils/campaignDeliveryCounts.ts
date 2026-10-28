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

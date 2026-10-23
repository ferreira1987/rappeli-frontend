export const realtimeConfig = {
  companyInboxChannelName(companyId: number): string {
    return `company.${companyId}.inbox`
  },
  events: {
    messageCreated: '.inbox.message.created',
    messageStatus: '.inbox.message.status',
  },
} as const

export function isRealtimeConfigured(): boolean {
  return Boolean(import.meta.env.VITE_REVERB_APP_KEY)
}

export const realtimeConfig = {
  companyInboxChannelName(companyId: number): string {
    return `company.${companyId}.inbox`
  },
  events: {
    messageCreated: '.inbox.message.created',
    messageStatus: '.inbox.message.status',
  },
} as const

let missingConfigWarned = false

export function isRealtimeConfigured(): boolean {
  return Boolean(import.meta.env.VITE_REVERB_APP_KEY?.trim())
}

export function warnIfReverbNotConfigured(): void {
  if (missingConfigWarned || isRealtimeConfigured()) {
    return
  }
  missingConfigWarned = true
  console.warn(
    '[Rappeli] Tempo real desativado: VITE_REVERB_APP_KEY não está no bundle. ' +
      'Configure as variáveis VITE_REVERB_* no build de produção (GitHub Actions Variables). ' +
      'A caixa de entrada continuará funcionando via API, sem atualização instantânea.',
  )
}

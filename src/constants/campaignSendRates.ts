export type CampaignSendRateOptionValue = 'default' | '1/s' | '2/s' | '5/m' | '20/m' | '60/m'

export interface CampaignSendRateOption {
  value: CampaignSendRateOptionValue
  label: string
}

export const CAMPAIGN_SEND_RATE_OPTIONS: CampaignSendRateOption[] = [
  { value: 'default', label: 'Padrão (5 mensagens/min)' },
  { value: '1/s', label: '1 mensagem/segundo' },
  { value: '2/s', label: '2 mensagens/segundo' },
  { value: '5/m', label: '5 mensagens/minuto' },
  { value: '20/m', label: '20 mensagens/minuto' },
  { value: '60/m', label: '60 mensagens/minuto' },
]

export const CAMPAIGN_SEND_RATE_HELP =
  'Limitar a velocidade de envio reduz o risco de bloqueio ou restrições pela Meta no WhatsApp.'

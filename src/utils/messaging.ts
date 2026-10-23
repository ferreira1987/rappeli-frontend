import axios from 'axios'

const WINDOW_CLOSED_CODES = new Set([
  'whatsapp_window_closed',
  'messaging_window_closed',
  'conversation_window_closed',
])

const WINDOW_CLOSED_HINTS = [
  'janela de 24',
  '24 horas',
  '24h',
  'messaging window',
  '24-hour whatsapp',
]

export function isMessagingWindowClosedError(error: unknown): boolean {
  if (!axios.isAxiosError(error) || error.response?.status !== 422) {
    return false
  }

  const data = error.response.data as {
    message?: string
    code?: string
    errors?: Record<string, string[]>
  }

  if (data.code && WINDOW_CLOSED_CODES.has(data.code)) {
    return true
  }

  const haystack = [
    data.message,
    ...(data.errors ? Object.values(data.errors).flat() : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return WINDOW_CLOSED_HINTS.some((hint) => haystack.includes(hint))
}

export const MESSAGING_WINDOW_CLOSED_MESSAGE =
  'A janela de 24 horas do WhatsApp está fechada. Aguarde uma nova mensagem do contato para responder.'

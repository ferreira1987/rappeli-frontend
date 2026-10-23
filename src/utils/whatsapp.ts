import axios from 'axios'

import { getErrorMessage, getValidationErrors } from '@/utils/errors'

export function getWhatsAppConnectError(error: unknown): string {
  const fieldErrors = getValidationErrors(error)
  if (fieldErrors?.whatsapp) {
    return fieldErrors.whatsapp
  }

  if (axios.isAxiosError(error)) {
    const errors = (error.response?.data as { errors?: Record<string, string[]> })?.errors
    const whatsapp = errors?.whatsapp?.[0]
    if (whatsapp) {
      return whatsapp
    }
  }

  return getErrorMessage(error)
}

export function formatQualityRating(rating: string | null | undefined): string {
  if (!rating) {
    return '—'
  }
  const normalized = rating.toUpperCase()
  if (normalized === 'GREEN') {
    return 'Alta'
  }
  if (normalized === 'YELLOW') {
    return 'Média'
  }
  if (normalized === 'RED') {
    return 'Baixa'
  }
  return rating
}

export function formatAccountStatus(status: string | null | undefined): string {
  if (!status) {
    return '—'
  }
  const map: Record<string, string> = {
    connected: 'Conectado',
    disconnected: 'Desconectado',
    pending: 'Pendente',
    error: 'Erro',
  }
  return map[status.toLowerCase()] ?? status
}

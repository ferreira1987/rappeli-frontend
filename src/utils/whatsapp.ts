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

export type WhatsAppQualityTone = 'green' | 'yellow' | 'red' | 'neutral'

export function formatQualityRatingDisplay(rating: string | null | undefined): {
  label: string
  tone: WhatsAppQualityTone
} {
  if (!rating) {
    return { label: '—', tone: 'neutral' }
  }
  const normalized = rating.toUpperCase()
  if (normalized === 'GREEN') {
    return { label: 'Alta (Verde)', tone: 'green' }
  }
  if (normalized === 'YELLOW') {
    return { label: 'Média (Amarelo)', tone: 'yellow' }
  }
  if (normalized === 'RED') {
    return { label: 'Baixa (Vermelho)', tone: 'red' }
  }
  return { label: rating, tone: 'neutral' }
}

/** Mascara identificadores da Meta para exibição (cópia usa o valor completo). */
export function maskWhatsAppIdentifier(id: string | null | undefined, visiblePrefix = 12): string {
  const trimmed = id?.trim()
  if (!trimmed) {
    return '—'
  }
  if (trimmed.length <= visiblePrefix) {
    return `${trimmed}***`
  }
  return `${trimmed.slice(0, visiblePrefix)}***`
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

import type { MessageTemplateStatus } from '@/types/messageTemplates'

export function messageTemplateStatusLabel(status: MessageTemplateStatus | string | null | undefined): string {
  const normalized = String(status ?? 'PENDING').toUpperCase()
  if (normalized === 'APPROVED') {
    return 'Aprovado'
  }
  if (normalized === 'REJECTED') {
    return 'Rejeitado'
  }
  return 'Pendente'
}

export function messageTemplateStatusClass(
  status: MessageTemplateStatus | string | null | undefined,
): string {
  const normalized = String(status ?? 'PENDING').toUpperCase()
  if (normalized === 'APPROVED') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
  if (normalized === 'REJECTED') {
    return 'bg-red-50 text-red-700 border-red-200'
  }
  return 'bg-amber-50 text-amber-800 border-amber-200'
}

export function messageTemplateCategoryLabel(category: string | null | undefined): string {
  const normalized = String(category ?? '').toUpperCase()
  if (normalized === 'MARKETING') {
    return 'Marketing'
  }
  if (normalized === 'UTILITY') {
    return 'Utilidade'
  }
  if (normalized === 'AUTHENTICATION') {
    return 'Autenticação'
  }
  return category ?? '—'
}

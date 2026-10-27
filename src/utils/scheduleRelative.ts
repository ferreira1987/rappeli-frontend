function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Rótulo relativo para agendamentos (hoje, amanhã, ou data formatada). */
export function formatRelativeScheduleDay(isoDate: string, locale = 'pt-BR'): string {
  const date = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) {
    return isoDate
  }

  const today = startOfLocalDay(new Date())
  const target = startOfLocalDay(date)
  const diffDays = Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))

  if (diffDays === 0) {
    return 'hoje'
  }
  if (diffDays === 1) {
    return 'amanhã'
  }
  if (diffDays === -1) {
    return 'ontem'
  }

  return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })
}

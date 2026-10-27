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

/** Ex.: "Hoje, 14:00" ou "28/10/2026 às 10:00" — sem misturar relativo com data absoluta. */
export function formatCampaignScheduleLabel(isoDate: string, time: string, locale = 'pt-BR'): string {
  const relative = formatRelativeScheduleDay(isoDate, locale)
  if (relative === 'hoje' || relative === 'amanhã' || relative === 'ontem') {
    const label = relative.charAt(0).toUpperCase() + relative.slice(1)
    return `${label}, ${time}`
  }
  const date = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) {
    return `${isoDate} às ${time}`
  }
  const dateStr = date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  return `${dateStr} às ${time}`
}

export function isoDateFromOffset(dayOffset: number, reference = new Date()): string {
  const base = startOfLocalDay(reference)
  base.setDate(base.getDate() + dayOffset)
  const y = base.getFullYear()
  const m = String(base.getMonth() + 1).padStart(2, '0')
  const d = String(base.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseScheduleDateTime(isoDate: string, time: string): Date {
  const [hours, minutes] = time.split(':').map((part) => Number.parseInt(part, 10))
  const date = new Date(`${isoDate}T00:00:00`)
  date.setHours(hours || 0, minutes || 0, 0, 0)
  return date
}

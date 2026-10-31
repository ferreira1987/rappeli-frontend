import type { FunnelStage } from '@/types/funnel'

/** Heuristic for closed/won funnel columns (slug, title, or stage color from API). */
export function isFunnelWonStage(stage: FunnelStage | undefined | null): boolean {
  if (!stage) return false
  const slug = (stage.slug ?? '').toLowerCase()
  const title = (stage.title ?? '').toLowerCase()
  if (/fechado|ganho|won|closed|vendido/.test(slug)) return true
  if (/fechado|ganho/.test(title)) return true
  if (stage.color?.includes('emerald')) return true
  return false
}

export function funnelTagBadgeVariant(tag: string): 'neutral' | 'primary' {
  const lower = tag.toLowerCase()
  if (lower.includes('r$') || lower.includes('proposta') || lower.includes('plano')) {
    return 'primary'
  }
  return 'neutral'
}

import type { RouteLocationRaw } from 'vue-router'

import type { PanelBreadcrumb } from '@/constants/panelBreadcrumbs'

export type SettingsTabKey = 'empresa' | 'equipe' | 'plano' | 'whatsapp'

const TAB_LABELS: Record<SettingsTabKey, string> = {
  empresa: 'Empresa',
  equipe: 'Equipe',
  plano: 'Plano e cobrança',
  whatsapp: 'WhatsApp',
}

export function settingsTabFromQuery(raw: unknown): SettingsTabKey {
  const value = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  if (value === 'whatsapp') return 'whatsapp'
  if (value === 'equipe') return 'equipe'
  if (value === 'plano' || value === 'plano e cobrança' || value === 'plano e cobranca') {
    return 'plano'
  }
  if (value === 'empresa' || value === '') {
    return 'empresa'
  }
  return 'empresa'
}

export function settingsTabQueryValue(tab: SettingsTabKey): string {
  if (tab === 'whatsapp') return 'whatsapp'
  if (tab === 'equipe') return 'equipe'
  if (tab === 'plano') return 'plano'
  return 'empresa'
}

export function settingsTabLabel(tab: SettingsTabKey): string {
  return TAB_LABELS[tab]
}

export const SETTINGS_TAB_KEYS: SettingsTabKey[] = ['empresa', 'equipe', 'plano', 'whatsapp']

export function settingsSectionBreadcrumbs(sectionLabel: string): PanelBreadcrumb[] {
  const configuracoesTo: RouteLocationRaw = { name: 'configuracoes' }
  return [
    { label: 'Configurações', to: configuracoesTo },
    { label: sectionLabel },
  ]
}

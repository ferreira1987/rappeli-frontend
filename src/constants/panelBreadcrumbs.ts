import type { RouteLocationRaw } from 'vue-router'

export type PanelBreadcrumb = { label: string; to?: RouteLocationRaw }

export const panelRootBreadcrumb: PanelBreadcrumb = { label: 'Painel', to: { name: 'painel' } }

export function panelBreadcrumbs(...trail: PanelBreadcrumb[]): PanelBreadcrumb[] {
  return [panelRootBreadcrumb, ...trail]
}

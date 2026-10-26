export type PlanTierId = 'essencial' | 'profissional' | 'escala'

export type PlanFeature = {
  html: string
  highlight?: boolean
}

export const PLAN_TIER_SUBTITLES: Record<PlanTierId, string> = {
  essencial: 'Para clínicas e consultórios iniciando a automação',
  profissional: 'Operações com volume regular e múltiplos atendentes',
  escala: 'Grandes redes, policlínicas e alta demanda diária',
}

export const PLAN_TIER_FEATURES: Record<PlanTierId, PlanFeature[]> = {
  essencial: [
    { html: '<strong>1</strong> número de WhatsApp' },
    { html: '<strong>3</strong> atendentes' },
    { html: '<strong>2.000</strong> contatos' },
    { html: '<strong>5</strong> fluxos' },
    { html: '<strong>1.500</strong> lembretes/mês' },
    { html: '<strong>150</strong> mensagens de marketing/mês' },
    { html: 'Suporte humano em português' },
  ],
  profissional: [
    { html: '<strong>1</strong> número' },
    { html: '<strong>8</strong> atendentes' },
    { html: '<strong>10.000</strong> contatos' },
    { html: '<strong class="text-brand-indigo">Fluxos ilimitados</strong>', highlight: true },
    { html: '<strong>4.000</strong> lembretes/mês' },
    { html: '<strong>400</strong> marketing/mês' },
    { html: 'Suporte humano em português' },
  ],
  escala: [
    { html: '<strong>3</strong> números' },
    { html: '<strong>20</strong> atendentes' },
    { html: '<strong>50.000</strong> contatos' },
    { html: '<strong>Fluxos ilimitados</strong>' },
    { html: '<strong>10.000</strong> lembretes/mês' },
    { html: '<strong>1.000</strong> marketing/mês' },
    { html: 'Suporte humano em português' },
  ],
}

export const WHATSAPP_HELP_URL = 'https://wa.me/'

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
    { html: '<strong>1.500</strong> mensagens/mês' },
    { html: '<strong>1</strong> número de WhatsApp' },
    { html: '<strong>2.000</strong> contatos' },
    { html: '<strong>5</strong> fluxos' },
    { html: '<strong class="text-brand-indigo">Usuários ilimitados</strong>', highlight: true },
    { html: 'Implantação inclusa' },
    { html: 'Suporte humano em português' },
  ],
  profissional: [
    { html: '<strong>2.500</strong> mensagens/mês' },
    { html: '<strong>1</strong> número de WhatsApp' },
    { html: '<strong>10.000</strong> contatos' },
    { html: '<strong class="text-brand-indigo">Fluxos ilimitados</strong>', highlight: true },
    { html: '<strong class="text-brand-indigo">Usuários ilimitados</strong>', highlight: true },
    { html: 'Implantação inclusa' },
    { html: 'Suporte humano em português' },
  ],
  escala: [
    { html: '<strong>5.000</strong> mensagens/mês' },
    { html: '<strong>3</strong> números de WhatsApp' },
    { html: '<strong>50.000</strong> contatos' },
    { html: '<strong>Fluxos ilimitados</strong>' },
    { html: '<strong class="text-brand-indigo">Usuários ilimitados</strong>', highlight: true },
    { html: 'Implantação inclusa' },
    { html: 'Suporte humano em português' },
  ],
}

export const WHATSAPP_HELP_URL = 'https://wa.me/'

<script setup lang="ts">
import {
  Bell,
  ChevronDown,
  MessageSquare,
  Search,
  Send,
  Timer,
  TrendingUp,
  Users,
} from '@lucide/vue'

import ExampleDataBanner from '@/components/app/ExampleDataBanner.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const kpis = [
  { label: 'Conversas hoje', icon: MessageSquare, hint: 'Aguardando dados da API' },
  { label: 'Mensagens automáticas', icon: Send, hint: 'Aguardando dados da API' },
  { label: 'Tempo médio de resposta', icon: Timer, hint: 'Aguardando dados da API' },
  { label: 'Contatos novos', icon: Users, hint: 'Aguardando dados da API' },
]

const automationsPlaceholder = [
  { title: 'Lembrete agendado', description: 'Fluxo ilustrativo — configure na API.' },
  { title: 'Confirmação de atendimento', description: 'Fluxo ilustrativo — configure na API.' },
  { title: 'Boas-vindas', description: 'Fluxo ilustrativo — configure na API.' },
]
</script>

<template>
  <div class="min-h-full bg-brand-mist px-6 py-6 lg:px-8">
    <header class="flex flex-wrap items-center gap-4">
      <h1 class="font-display text-2xl font-semibold text-brand-ink">Painel</h1>

      <div class="relative ml-auto min-w-[200px] flex-1 max-w-xl">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" />
        <input
          type="search"
          disabled
          placeholder="Buscar conversas, telefones ou contatos"
          class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-brand-gray shadow-sm"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-brand-gray">
          WhatsApp — não conectado
        </span>
        <button type="button" class="relative rounded-lg bg-white p-2 text-brand-gray shadow-sm" disabled aria-label="Notificações">
          <Bell class="h-5 w-5" />
        </button>
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-brand-ink shadow-sm"
          disabled
        >
          <span class="max-w-[140px] truncate">{{ auth.user?.name ?? 'Conta' }}</span>
          <ChevronDown class="h-4 w-4 text-brand-gray" />
        </button>
        <button
          type="button"
          disabled
          class="inline-flex items-center gap-2 rounded-xl bg-brand-indigo px-4 py-2 text-sm font-semibold text-white opacity-60"
        >
          <Send class="h-4 w-4" />
          Envio manual
        </button>
      </div>
    </header>

    <div class="mt-6 space-y-6">
      <ExampleDataBanner message="Dados de exemplo | Estrutura do painel conforme o design Stitch — métricas reais virão da API." />

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="kpi in kpis"
          :key="kpi.label"
          class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
        >
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-medium text-brand-gray">{{ kpi.label }}</p>
            <component :is="kpi.icon" class="h-5 w-5 text-brand-indigo/40" />
          </div>
          <p class="mt-3 font-display text-3xl font-semibold text-brand-ink">—</p>
          <p class="mt-2 flex items-center gap-1 text-xs text-brand-gray">
            <TrendingUp class="h-3.5 w-3.5" />
            {{ kpi.hint }}
          </p>
        </article>
      </div>

      <div class="grid gap-4 xl:grid-cols-3">
        <section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-2">
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-display text-lg font-semibold text-brand-ink">Volume de mensagens</h2>
            <span class="rounded-full bg-brand-mist px-2.5 py-1 text-xs font-medium text-brand-indigo">7 dias</span>
          </div>
          <p class="mt-1 text-sm text-brand-gray">Comparativo ilustrativo — sem série temporal da API.</p>
          <div
            class="mt-6 flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-brand-gray"
          >
            Gráfico (placeholder)
          </div>
          <p class="mt-4 text-xs text-brand-gray">Taxa de entrega: —</p>
        </section>

        <section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 class="font-display text-lg font-semibold text-brand-ink">Automações ativas</h2>
          <ul class="mt-4 space-y-3">
            <li
              v-for="item in automationsPlaceholder"
              :key="item.title"
              class="rounded-xl border border-slate-100 bg-brand-mist/30 p-3"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="text-sm font-semibold text-brand-ink">{{ item.title }}</p>
                  <p class="mt-1 text-xs text-brand-gray">{{ item.description }}</p>
                </div>
                <span class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-brand-gray">Inativo</span>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <section class="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
          <h2 class="font-display text-lg font-semibold text-brand-ink">Últimas conversas</h2>
          <button type="button" class="text-sm font-medium text-brand-indigo" disabled>Ver todas</button>
        </div>
        <div class="px-5 py-12 text-center text-sm text-brand-gray">
          Nenhuma conversa sincronizada. A listagem será carregada quando a API de conversas estiver disponível.
        </div>
      </section>

      <AppPageFooter />
    </div>
  </div>
</template>

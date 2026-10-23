<script setup lang="ts">
import { Bell, Bot, Clock, Hand, Plus, Workflow } from '@lucide/vue'
import { RouterLink } from 'vue-router'

import ExampleDataBanner from '@/components/app/ExampleDataBanner.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'

const tabs = ['Todas', 'Ativas', 'Pausadas', 'Modelos'] as const
const activeTab = 'Todas'

const cards = [
  {
    title: 'Boas-vindas',
    description: 'Mensagem inicial ao primeiro contato — exemplo de layout.',
    icon: Hand,
    accent: 'indigo',
    status: 'Pausado',
  },
  {
    title: 'Horário de atendimento',
    description: 'Resposta fora do expediente — exemplo de layout.',
    icon: Clock,
    accent: 'indigo',
    status: 'Pausado',
  },
  {
    title: 'Lembrete agendado',
    description: 'Gatilho por data ou prazo — exemplo de layout.',
    icon: Bell,
    accent: 'coral',
    status: 'Pausado',
  },
]
</script>

<template>
  <div class="min-h-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
    <nav class="text-sm text-brand-gray">
      <span>Painel</span>
      <span class="mx-1">/</span>
      <span class="text-brand-ink">Automações</span>
    </nav>

    <header class="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <span class="inline-flex items-center gap-1 rounded-full bg-brand-mist px-2.5 py-1 text-xs font-medium text-brand-indigo">
          <Bot class="h-3.5 w-3.5" />
          Fluxos automáticos
        </span>
        <h1 class="mt-2 font-display text-2xl font-semibold text-brand-ink">Automações</h1>
        <p class="mt-1 max-w-2xl text-sm text-brand-gray">
          Crie, gerencie e monitore fluxos de mensagens via WhatsApp. Os fluxos reais serão carregados da API.
        </p>
      </div>
      <RouterLink
        :to="{ name: 'automacao-editor' }"
        class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-indigo px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-indigo-hover sm:w-auto"
      >
        <Plus class="h-4 w-4" />
        Nova automação
      </RouterLink>
    </header>

    <div class="mt-6 space-y-6">
      <ExampleDataBanner />

      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab"
          type="button"
          class="rounded-full px-4 py-1.5 text-sm font-medium"
          :class="tab === activeTab ? 'bg-brand-mist text-brand-indigo' : 'bg-white text-brand-gray border border-slate-200'"
          disabled
        >
          {{ tab }}
        </button>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="card in cards"
          :key="card.title"
          class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        >
          <div class="h-1" :class="card.accent === 'coral' ? 'bg-brand-coral' : 'bg-brand-indigo'" />
          <div class="p-5">
            <div class="flex items-start justify-between gap-2">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-mist text-brand-indigo"
              >
                <component :is="card.icon" class="h-5 w-5" />
              </div>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-brand-gray">
                {{ card.status }}
              </span>
            </div>
            <h2 class="mt-4 font-display text-base font-semibold text-brand-ink">{{ card.title }}</h2>
            <p class="mt-2 text-sm text-brand-gray">{{ card.description }}</p>
            <p class="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-brand-gray">
              <Workflow class="mr-1 inline h-3.5 w-3.5" />
              Gatilho: definido na API (placeholder)
            </p>
          </div>
        </article>

        <RouterLink
          :to="{ name: 'automacao-editor' }"
          class="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center transition hover:border-brand-indigo/40 hover:bg-brand-mist/30"
        >
          <Plus class="h-8 w-8 text-brand-indigo" />
          <p class="mt-3 font-display font-semibold text-brand-ink">Criar automação do zero</p>
          <p class="mt-1 text-sm text-brand-gray">Abrir editor visual (layout Stitch)</p>
        </RouterLink>
      </div>

      <AppPageFooter />
    </div>
  </div>
</template>

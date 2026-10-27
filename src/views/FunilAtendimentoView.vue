<script setup lang="ts">
import { Calendar, Filter, MessageSquare, Plus, Search } from '@lucide/vue'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import type { FunnelCard, FunnelStageId } from '@/mocks/funnel'
import { exampleFunnelCards, funnelStages } from '@/services/example'

const search = ref('')

const cardsByStage = computed(() => {
  const q = search.value.trim().toLowerCase()
  const map = new Map<FunnelStageId, FunnelCard[]>()
  for (const stage of funnelStages) {
    map.set(stage.id, [])
  }
  for (const card of exampleFunnelCards) {
    if (q && !card.contactName.toLowerCase().includes(q) && !card.phone.includes(q)) {
      continue
    }
    map.get(card.stageId)?.push(card)
  }
  return map
})

function tagClasses(tone: FunnelCard['tags'][number]['tone']): string {
  const map = {
    purple: 'bg-violet-50 text-violet-700 border-violet-200',
    gray: 'bg-slate-50 text-slate-600 border-slate-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  }
  return map[tone]
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="Funil de atendimento"
      :breadcrumbs="[{ label: 'Painel', to: '/painel' }, { label: 'Funil de atendimento' }]"
      show-example-badge
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-brand-ink hover:bg-slate-50"
        >
          <Filter class="h-4 w-4 text-brand-gray" />
          Filtros
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-brand-ink hover:bg-slate-50"
        >
          <Calendar class="h-4 w-4 text-brand-gray" />
          Agendar mensagem
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
        >
          <Plus class="h-4 w-4" />
          Novo card
        </button>
      </template>
    </AppPageHeader>

    <div class="border-b border-slate-200/80 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative min-w-[200px] flex-1">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" />
          <input
            v-model="search"
            type="search"
            placeholder="Buscar contato…"
            class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-brand-indigo focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
          />
        </div>
        <select class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-brand-ink">
          <option>Todos os atendentes</option>
        </select>
        <select class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-brand-ink">
          <option>Todos os setores</option>
        </select>
        <select class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-brand-ink">
          <option>Origem</option>
        </select>
        <button
          type="button"
          class="ml-auto text-sm font-semibold text-brand-indigo hover:underline"
        >
          + Adicionar etapa
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8">
      <div class="flex min-h-[420px] gap-4">
        <div
          v-for="stage in funnelStages"
          :key="stage.id"
          class="flex w-[min(100%,280px)] shrink-0 flex-col rounded-xl border border-slate-200/80 bg-white/80"
        >
          <div class="flex items-center gap-2 border-b border-slate-100 px-3 py-3">
            <span class="h-2 w-2 rounded-full" :class="stage.dotClass" />
            <h2 class="text-sm font-semibold text-brand-ink">{{ stage.title }}</h2>
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-brand-gray">
              {{ cardsByStage.get(stage.id)?.length ?? 0 }}
            </span>
            <button type="button" class="ml-auto rounded p-1 text-brand-gray hover:bg-slate-100">
              <Plus class="h-4 w-4" />
            </button>
          </div>
          <div class="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
            <article
              v-for="card in cardsByStage.get(stage.id)"
              :key="card.id"
              class="relative rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition"
              :class="card.moving ? 'ring-2 ring-blue-200' : ''"
            >
              <span
                v-if="card.moving"
                class="absolute right-2 top-2 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700"
              >
                Movendo
              </span>
              <div v-if="card.scheduledBanner" class="mb-2 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-800">
                {{ card.scheduledBanner }}
              </div>
              <div class="flex items-start justify-between gap-2">
                <p class="font-semibold text-sm text-brand-ink">{{ card.contactName }}</p>
                <span class="shrink-0 text-[11px] text-brand-gray">{{ card.relativeTime }}</span>
              </div>
              <p class="mt-0.5 flex items-center gap-1 text-[11px] text-brand-gray">
                <MessageSquare class="h-3 w-3" />
                {{ card.phone }}
              </p>
              <p class="mt-2 line-clamp-2 text-xs text-brand-gray">{{ card.lastMessage }}</p>
              <div class="mt-2 flex flex-wrap gap-1">
                <span
                  v-for="tag in card.tags"
                  :key="tag.label"
                  class="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                  :class="tagClasses(tag.tone)"
                >
                  {{ tag.label }}
                </span>
              </div>
              <div class="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                <div class="flex items-center gap-2">
                  <span
                    class="flex h-6 w-6 items-center justify-center rounded-full bg-brand-mist text-[10px] font-bold text-brand-indigo"
                  >
                    {{ card.assigneeInitials }}
                  </span>
                  <span class="text-[11px] text-brand-gray">{{ card.assigneeShortName }}</span>
                </div>
                <RouterLink
                  :to="{ name: 'conversas' }"
                  class="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-indigo hover:underline"
                >
                  <MessageSquare class="h-3 w-3" />
                  Abrir conversa
                </RouterLink>
              </div>
            </article>
          </div>
        </div>
      </div>
      <div class="mt-6">
        <AppPageFooter />
      </div>
    </div>
  </div>
</template>

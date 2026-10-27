<script setup lang="ts">
import { Play, Settings } from '@lucide/vue'
import { RouterLink } from 'vue-router'

import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import { exampleFollowUpSequence } from '@/services/example'

const seq = exampleFollowUpSequence
const breadcrumbs = panelBreadcrumbs(
  { label: 'Campanhas', to: { name: 'campanhas' } },
  { label: 'Sequências', to: { name: 'campanhas-sequencias' } },
  { label: 'Nova sequência' },
)
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="Nova sequência"
      :breadcrumbs="breadcrumbs"
      show-example-badge
    >
      <template #actions>
        <RouterLink
          :to="{ name: 'campanhas-sequencias' }"
          class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
        >
          Cancelar
        </RouterLink>
        <button type="button" class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">
          Salvar rascunho
        </button>
        <button type="button" class="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white">
          <Play class="h-4 w-4" />
          Ativar sequência
        </button>
      </template>
    </AppPageHeader>

    <div class="flex flex-1 flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
      <section class="w-full space-y-4 lg:w-[360px] shrink-0">
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <h2 class="flex items-center gap-2 font-display text-sm font-bold text-brand-ink">
              <Settings class="h-4 w-4" />
              Configurações da sequência
            </h2>
            <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Pronta</span>
          </div>
          <label class="mt-4 block text-xs font-semibold text-brand-ink">Nome da sequência *</label>
          <input :value="seq.name" type="text" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" readonly />
          <label class="mt-3 block text-xs font-semibold text-brand-ink">Gatilho de entrada *</label>
          <select
            class="mt-1 w-full min-w-0 truncate rounded-lg border border-slate-200 px-3 py-2 text-sm"
            :title="seq.trigger"
          >
            <option>{{ seq.trigger }}</option>
          </select>
          <div class="mt-4 rounded-lg border border-brand-indigo/20 bg-brand-mist/50 p-3">
            <p class="text-xs font-semibold text-brand-indigo">{{ seq.eligibleCount }} pacientes</p>
            <div class="mt-2 flex flex-wrap gap-1">
              <span v-for="f in seq.filters" :key="f" class="rounded-full bg-white px-2 py-0.5 text-[10px] border border-slate-200">{{ f }}</span>
            </div>
          </div>
          <label class="mt-4 flex items-center justify-between text-xs">
            <span>Parar sequência ao responder</span>
            <input type="checkbox" checked class="h-4 w-4 rounded text-brand-indigo" />
          </label>
          <label class="mt-2 flex items-center justify-between text-xs">
            <span>Enviar apenas com opt-in</span>
            <input type="checkbox" checked class="h-4 w-4 rounded text-brand-indigo" />
          </label>
          <p class="mt-1 text-[10px] text-brand-gray">Bloqueado por conformidade com as políticas oficiais do WhatsApp.</p>
          <div class="mt-4 grid grid-cols-2 gap-2">
            <div>
              <label class="text-[10px] font-semibold uppercase text-brand-gray">Início</label>
              <input :value="seq.windowStart" type="time" class="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm" readonly />
            </div>
            <div>
              <label class="text-[10px] font-semibold uppercase text-brand-gray">Término</label>
              <input :value="seq.windowEnd" type="time" class="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm" readonly />
            </div>
          </div>
          <div class="mt-4 rounded-lg border border-slate-200 p-3 text-xs">
            <p class="font-semibold text-brand-ink">Setor ao receber resposta</p>
            <p class="text-brand-gray">{{ seq.sectorOnReply }}</p>
          </div>
        </div>
      </section>

      <section class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="font-display text-sm font-bold text-brand-ink">Fluxo da régua de relacionamento</h2>
            <p class="text-xs text-brand-gray">
              {{ seq.steps.length }} etapas configuradas · Previsão total de ciclo: ~{{ seq.totalCycleDays }} dias
            </p>
          </div>
        </div>
        <div class="mt-6 space-y-4">
          <template v-for="(step, index) in seq.steps" :key="step.order">
            <article
              v-if="step.kind === 'message'"
              class="rounded-xl border border-slate-200 p-4"
            >
              <div class="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase text-brand-gray">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-brand-indigo text-white">{{ step.order }}</span>
                {{ step.label }}
                <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">Aprovado pela Meta</span>
              </div>
              <h3 class="mt-2 text-sm font-semibold text-brand-ink">{{ step.title }}</h3>
              <p class="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-brand-gray">{{ step.preview }}</p>
            </article>
            <article v-else class="rounded-xl border border-amber-200 bg-amber-50/30 p-4">
              <div class="flex items-center gap-2 text-[10px] font-bold uppercase text-amber-800">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">{{ step.order }}</span>
                {{ step.label }}
              </div>
              <h3 class="mt-2 text-sm font-semibold text-brand-ink">{{ step.title }}</h3>
              <div class="mt-3 grid gap-2 sm:grid-cols-2">
                <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs">
                  <p class="font-semibold text-emerald-800">Sim (respondeu)</p>
                  <p class="mt-1 text-emerald-900">{{ step.yesAction }}</p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                  <p class="font-semibold text-brand-ink">Não (sem resposta)</p>
                  <p class="mt-1 text-brand-gray">{{ step.noAction }}</p>
                </div>
              </div>
            </article>
            <p
              v-if="step.waitLabel && index < seq.steps.length - 1"
              class="text-center text-xs text-brand-gray"
            >
              ⏳ {{ step.waitLabel }}
            </p>
          </template>
        </div>
        <AppPageFooter class="mt-8" />
      </section>
    </div>
  </div>
</template>

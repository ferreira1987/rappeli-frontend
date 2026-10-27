<script setup lang="ts">
import { GitBranch, Plus } from '@lucide/vue'
import { RouterLink } from 'vue-router'

import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import { exampleSequences } from '@/services/example'
import { pluralizePt } from '@/utils/pluralize'

const breadcrumbs = panelBreadcrumbs({ label: 'Campanhas', to: { name: 'campanhas' } }, { label: 'Sequências' })
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader title="Sequências" :breadcrumbs="breadcrumbs" show-example-badge>
      <template #actions>
        <RouterLink
          :to="{ name: 'campanhas-sequencias-nova' }"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
        >
          <Plus class="h-4 w-4" />
          Nova sequência
        </RouterLink>
      </template>
    </AppPageHeader>

    <div class="flex-1 space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <p class="text-sm text-brand-gray">
        {{ pluralizePt(exampleSequences.length, 'sequência') }} de exemplo — disparos automáticos por gatilho e tempo.
      </p>
      <div class="grid gap-4 md:grid-cols-2">
        <article
          v-for="seq in exampleSequences"
          :key="seq.id"
          class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
        >
          <div class="flex items-start justify-between gap-2">
            <h2 class="font-semibold text-brand-ink">{{ seq.name }}</h2>
            <span
              v-if="seq.active"
              class="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
            >
              Em execução
            </span>
          </div>
          <p class="mt-2 text-xs text-brand-gray">{{ seq.description }}</p>
          <p class="mt-3 text-xs text-brand-gray">
            {{ pluralizePt(seq.steps, 'etapa') }} ·
            {{ pluralizePt(seq.contactsInProgress, 'contato') }} em andamento
          </p>
          <RouterLink
            :to="{ name: 'campanhas-sequencias-nova' }"
            class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-indigo hover:underline"
          >
            <GitBranch class="h-4 w-4" />
            Editar sequência
          </RouterLink>
        </article>
      </div>
      <RouterLink :to="{ name: 'campanhas' }" class="text-sm font-semibold text-brand-indigo hover:underline">
        ← Voltar para campanhas
      </RouterLink>
      <AppPageFooter />
    </div>
  </div>
</template>

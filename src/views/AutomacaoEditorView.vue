<script setup lang="ts">
import { Bot } from '@lucide/vue'
import { RouterLink } from 'vue-router'

import AppPageHeader from '@/components/app/AppPageHeader.vue'
import EmptyState from '@/components/app/EmptyState.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-surface">
    <AppPageHeader
      title="Editor de automação"
      subtitle="O construtor visual de fluxos ainda não está disponível nesta versão."
      :breadcrumbs="panelBreadcrumbs(
        { label: 'Automações', to: { name: 'automacoes' } },
        { label: 'Editor de automação' },
      )"
    >
      <template #badges>
        <span
          class="inline-flex items-center gap-1 rounded-full bg-brand-mist px-2.5 py-1 text-xs font-medium text-brand-indigo"
        >
          Novo em breve
        </span>
      </template>
    </AppPageHeader>

    <div class="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <EmptyState
        :icon="Bot"
        title="Editor de fluxos"
        description="Você poderá montar fluxos arrastando blocos. Por enquanto, configure respostas automáticas pelo menu lateral."
      >
        <template #actions>
          <RouterLink
            :to="{ name: 'automacoes' }"
            class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-slate-50"
          >
            Voltar
          </RouterLink>
          <RouterLink
            :to="{ name: 'respostas-automaticas' }"
            class="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
          >
            Respostas automáticas
          </RouterLink>
        </template>
      </EmptyState>

      <AppPageFooter />
    </div>
  </div>
</template>

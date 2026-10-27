<script setup lang="ts">
import { Bot } from '@lucide/vue'
import { RouterLink } from 'vue-router'

import AppPageHeader from '@/components/app/AppPageHeader.vue'
import EmptyState from '@/components/app/EmptyState.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="Automações"
      subtitle="Fluxos visuais com gatilhos e ramificações estarão disponíveis em uma próxima versão."
      :breadcrumbs="panelBreadcrumbs({ label: 'Automações' })"
    >
      <template #badges>
        <span
          class="inline-flex items-center gap-1 rounded-full bg-brand-mist px-2.5 py-1 text-xs font-medium text-brand-indigo"
        >
          <Bot class="h-3.5 w-3.5" aria-hidden="true" />
          Em breve
        </span>
      </template>
    </AppPageHeader>

    <div class="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <EmptyState
        :icon="Bot"
        title="Editor de fluxos em breve"
        description="Enquanto isso, use Respostas automáticas para boas-vindas, horário de atendimento e palavras-chave."
      >
        <template #actions>
          <RouterLink
            :to="{ name: 'respostas-automaticas' }"
            class="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
          >
            Ir para respostas automáticas
          </RouterLink>
        </template>
      </EmptyState>

      <AppPageFooter />
    </div>
  </div>
</template>

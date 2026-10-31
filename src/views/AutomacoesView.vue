<script setup lang="ts">
import { ArrowRight, Bot } from '@lucide/vue'
import { RouterLink } from 'vue-router'

import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'

const headerBreadcrumbs = panelBreadcrumbs({ label: 'Automação' }, { label: 'Automações' })
</script>

<template>
  <AppPageShell
    title="Automações"
    subtitle="Fluxos visuais com gatilhos e ramificações estarão disponíveis em uma próxima versão."
    :breadcrumbs="headerBreadcrumbs"
  >
    <template #badges>
      <UiBadge variant="primary" size="md">Novo em breve</UiBadge>
    </template>

    <div class="flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div
        class="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center sm:min-h-[320px]"
      >
        <span
          class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-mist"
          aria-hidden="true"
        >
          <Bot class="h-7 w-7 text-brand-indigo" />
        </span>
        <h2 class="text-lg font-semibold text-brand-ink">Editor de fluxos em breve</h2>
        <p class="mt-2 max-w-md text-sm text-brand-gray">
          Enquanto isso, use Respostas automáticas para boas-vindas, horário de atendimento e palavras-chave.
        </p>
        <div class="mt-6">
          <RouterLink :to="{ name: 'respostas-automaticas' }" class="inline-flex">
            <UiButton>
              Ir para respostas automáticas
              <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </UiButton>
          </RouterLink>
        </div>
      </div>

      <AppPageFooter class="mt-auto pt-6" />
    </div>
  </AppPageShell>
</template>

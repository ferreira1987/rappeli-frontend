<script setup lang="ts">
import { Bot } from '@lucide/vue'
import { RouterLink } from 'vue-router'

import EmptyState from '@/components/app/EmptyState.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
</script>

<template>
  <div class="min-h-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
    <nav class="text-sm text-brand-gray">
      <span>Painel</span>
      <span class="mx-1">/</span>
      <span class="text-brand-ink">Automações</span>
    </nav>

    <header class="mt-4">
      <span
        class="inline-flex items-center gap-1 rounded-full bg-brand-mist px-2.5 py-1 text-xs font-medium text-brand-indigo"
      >
        <Bot class="h-3.5 w-3.5" aria-hidden="true" />
        Em breve
      </span>
      <h1 class="mt-2 font-display text-2xl font-semibold text-brand-ink">Automações</h1>
      <p class="mt-1 max-w-2xl text-sm text-brand-gray">
        Fluxos visuais com gatilhos e ramificações estarão disponíveis em uma próxima versão.
      </p>
    </header>

    <div class="mt-6 space-y-6">
      <EmptyState
        :icon="Bot"
        title="Editor de fluxos em breve"
        description="Enquanto isso, use Respostas automáticas para boas-vindas, horário de atendimento e palavras-chave."
      >
        <template #actions>
          <RouterLink
            :to="{ name: 'respostas-automaticas' }"
            class="rounded-xl bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
          >
            Ir para respostas automáticas
          </RouterLink>
        </template>
      </EmptyState>

      <AppPageFooter />
    </div>
  </div>
</template>

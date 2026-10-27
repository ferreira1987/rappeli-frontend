<script setup lang="ts">
import { Plus, Upload, Users } from '@lucide/vue'
import { ref } from 'vue'

import AppPageHeader from '@/components/app/AppPageHeader.vue'
import EmptyState from '@/components/app/EmptyState.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'

const comingSoonMessage = ref<string | null>(null)

function showComingSoon(): void {
  comingSoonMessage.value = 'Esta função estará disponível em breve.'
  window.setTimeout(() => {
    comingSoonMessage.value = null
  }, 4000)
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="Contatos"
      subtitle="Organize clientes, tags e importações em um só lugar."
      :breadcrumbs="panelBreadcrumbs({ label: 'Contatos' })"
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-slate-50"
          @click="showComingSoon"
        >
          <Upload class="h-4 w-4 text-brand-gray" aria-hidden="true" />
          Importar CSV
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
          @click="showComingSoon"
        >
          <Plus class="h-4 w-4" aria-hidden="true" />
          Novo contato
        </button>
      </template>
    </AppPageHeader>

    <div class="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <p v-if="comingSoonMessage" class="text-sm text-brand-indigo" role="status">
        {{ comingSoonMessage }}
      </p>

      <EmptyState
        :icon="Users"
        title="Nenhum contato cadastrado"
        description="Importe uma planilha ou adicione contatos manualmente quando a listagem estiver ativa."
      >
        <template #actions>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-slate-50"
            @click="showComingSoon"
          >
            <Upload class="h-4 w-4 text-brand-gray" aria-hidden="true" />
            Importar CSV
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
            @click="showComingSoon"
          >
            <Plus class="h-4 w-4" aria-hidden="true" />
            Novo contato
          </button>
        </template>
      </EmptyState>

      <AppPageFooter />
    </div>
  </div>
</template>

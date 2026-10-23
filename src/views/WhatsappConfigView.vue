<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import { RouterLink } from 'vue-router'

import WhatsAppSettingsPanel from '@/components/whatsapp/WhatsAppSettingsPanel.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
</script>

<template>
  <div class="min-h-full px-6 py-6 lg:px-8">
    <header class="flex flex-wrap items-center gap-4">
      <RouterLink
        :to="{ name: 'configuracoes' }"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-brand-gray hover:text-brand-ink"
      >
        <ArrowLeft class="h-4 w-4" aria-hidden="true" />
        Configurações
      </RouterLink>
      <div class="min-w-0 flex-1">
        <h1 class="font-display text-2xl font-semibold text-brand-ink">WhatsApp</h1>
        <p class="mt-1 text-sm text-brand-gray">Conexão do canal com a API oficial da Meta.</p>
      </div>
    </header>

    <div class="mt-6 space-y-6">
      <WhatsAppSettingsPanel />
      <AppPageFooter />
    </div>
  </div>
</template>

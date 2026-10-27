<script setup lang="ts">
import WhatsAppSettingsPanel from '@/components/whatsapp/WhatsAppSettingsPanel.vue'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="WhatsApp"
      subtitle="Conexão do canal com a API oficial da Meta."
      :breadcrumbs="panelBreadcrumbs(
        { label: 'Configurações', to: { name: 'configuracoes' } },
        { label: 'WhatsApp' },
      )"
    />

    <div class="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <WhatsAppSettingsPanel />
      <AppPageFooter />
    </div>
  </div>
</template>

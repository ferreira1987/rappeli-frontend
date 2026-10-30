<script setup lang="ts">
import WhatsAppBusinessSettings from '@/components/settings/WhatsAppBusinessSettings.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import { settingsSectionBreadcrumbs } from '@/utils/settingsTab'
</script>

<template>
  <AppPageShell
    title="WhatsApp"
    :breadcrumbs="settingsSectionBreadcrumbs('WhatsApp')"
  >
    <div class="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <WhatsAppBusinessSettings />
      <AppPageFooter />
    </div>
  </AppPageShell>
</template>

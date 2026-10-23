<script setup lang="ts">
import { Settings } from '@lucide/vue'

import EmptyState from '@/components/app/EmptyState.vue'
</script>

<template>
  <EmptyState
    :icon="Settings"
    title="Configurações"
    description="Preferências da conta, conexão com WhatsApp e equipe serão configuradas nesta seção."
  />
</template>

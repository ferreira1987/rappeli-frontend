<script setup lang="ts">
import { Bot } from '@lucide/vue'

import EmptyState from '@/components/app/EmptyState.vue'
</script>

<template>
  <EmptyState
    :icon="Bot"
    title="Automações"
    description="Você ainda não configurou automações. Crie fluxos de lembretes e avisos quando esta funcionalidade estiver disponível."
  />
</template>

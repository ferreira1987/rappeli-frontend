<script setup lang="ts">
import { MessageCircle } from '@lucide/vue'

import EmptyState from '@/components/app/EmptyState.vue'
</script>

<template>
  <EmptyState
    :icon="MessageCircle"
    title="Conversas"
    description="Nenhuma conversa para exibir. Quando o WhatsApp estiver conectado, as mensagens aparecerão nesta área."
  />
</template>

<script setup lang="ts">
import { Users } from '@lucide/vue'

import EmptyState from '@/components/app/EmptyState.vue'
</script>

<template>
  <EmptyState
    :icon="Users"
    title="Contatos"
    description="Sua base de contatos ficará disponível aqui. Importe ou sincronize clientes na fase de integração."
  />
</template>

<script setup lang="ts">
import { LayoutGrid } from '@lucide/vue'

import EmptyState from '@/components/app/EmptyState.vue'
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
      Ambiente em configuração. Os indicadores do painel serão exibidos quando houver dados
      conectados à API.
    </div>
    <EmptyState
      :icon="LayoutGrid"
      title="Painel"
      description="Métricas, gráficos e conversas recentes aparecerão aqui assim que a integração com o backend estiver ativa."
    />
  </div>
</template>

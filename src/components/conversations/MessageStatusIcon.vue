<script setup lang="ts">
import { AlertCircle, Check, CheckCheck, Clock } from '@lucide/vue'
import { computed } from 'vue'

import type { MessageDeliveryStatus } from '@/types/conversations'

const props = defineProps<{
  status: MessageDeliveryStatus | null | undefined
}>()

const label = computed(() => {
  switch (props.status) {
    case 'pending':
      return 'Enviando'
    case 'sent':
      return 'Enviada'
    case 'delivered':
      return 'Entregue'
    case 'read':
      return 'Lida'
    case 'failed':
      return 'Falhou'
    default:
      return ''
  }
})
</script>

<template>
  <span
    v-if="label"
    class="inline-flex items-center gap-0.5 text-[10px] font-medium"
    :class="status === 'failed' ? 'text-red-500' : 'text-brand-gray'"
    :title="label"
    :aria-label="label"
  >
    <Clock v-if="status === 'pending'" class="h-3 w-3" aria-hidden="true" />
    <Check v-else-if="status === 'sent'" class="h-3 w-3" aria-hidden="true" />
    <CheckCheck
      v-else-if="status === 'delivered' || status === 'read'"
      class="h-3 w-3"
      :class="status === 'read' ? 'text-brand-indigo' : ''"
      aria-hidden="true"
    />
    <AlertCircle v-else-if="status === 'failed'" class="h-3 w-3" aria-hidden="true" />
    <span class="sr-only">{{ label }}</span>
  </span>
</template>

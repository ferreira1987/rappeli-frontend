<script setup lang="ts">
import { AlertCircle, Check, CheckCheck, Clock } from '@lucide/vue'
import { computed } from 'vue'

import type { MessageDeliveryStatus } from '@/types/conversations'
import { formatMessageDeliveryTooltip } from '@/utils/messageDeliveryStatus'

const props = withDefaults(
  defineProps<{
    status: MessageDeliveryStatus | null | undefined
    deliveredAt?: string | null
    readAt?: string | null
    failedAt?: string | null
    failureReason?: string | null
    /** Ícones sobre bolha roxa (mensagem enviada no thread). */
    onBrandBubble?: boolean
  }>(),
  {
    onBrandBubble: false,
  },
)

const tooltip = computed(() =>
  formatMessageDeliveryTooltip({
    status: props.status,
    delivered_at: props.deliveredAt,
    read_at: props.readAt,
    failed_at: props.failedAt,
    failure_reason: props.failureReason,
  }),
)

const label = computed(() => {
  const firstLine = tooltip.value.split('\n')[0]
  return firstLine ?? ''
})

const iconClass = computed(() => {
  if (props.status === 'failed') {
    return props.onBrandBubble ? 'text-red-200' : 'text-red-500'
  }
  if (props.status === 'read') {
    return props.onBrandBubble ? 'text-sky-200' : 'text-brand-indigo'
  }
  if (props.onBrandBubble) {
    return 'text-indigo-100'
  }
  return 'text-brand-gray'
})
</script>

<template>
  <span
    v-if="label"
    class="inline-flex items-center gap-0.5 text-[10px] font-medium"
    :class="iconClass"
    :title="tooltip"
    :aria-label="label"
  >
    <Clock v-if="status === 'pending'" class="h-3 w-3 shrink-0" aria-hidden="true" />
    <Check v-else-if="status === 'sent'" class="h-3 w-3 shrink-0" aria-hidden="true" />
    <CheckCheck
      v-else-if="status === 'delivered' || status === 'read'"
      class="h-3 w-3 shrink-0"
      aria-hidden="true"
    />
    <AlertCircle v-else-if="status === 'failed'" class="h-3 w-3 shrink-0" aria-hidden="true" />
    <span class="sr-only">{{ label }}</span>
  </span>
</template>

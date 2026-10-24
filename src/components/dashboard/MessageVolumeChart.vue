<script setup lang="ts">
import { computed } from 'vue'

import type { DashboardMessageVolume } from '@/types/dashboard'

const props = defineProps<{
  volume: DashboardMessageVolume
}>()

const maxValue = computed(() => {
  let max = 1
  for (const point of props.volume.points) {
    max = Math.max(max, point.outbound, point.inbound)
  }
  return max
})

function barHeight(value: number): string {
  const ratio = value / maxValue.value
  return `${Math.max(ratio * 100, value > 0 ? 8 : 0)}%`
}

function dayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) {
    return isoDate
  }
  return date.toLocaleDateString('pt-BR', { weekday: 'short' })
}
</script>

<template>
  <div class="mt-4 flex h-48 items-end gap-2 sm:gap-3">
    <div
      v-for="point in volume.points"
      :key="point.date"
      class="flex min-w-0 flex-1 flex-col items-center gap-1"
    >
      <div class="flex h-40 w-full items-end justify-center gap-1">
        <div
          class="w-[42%] rounded-t-md bg-brand-indigo transition-all"
          :style="{ height: barHeight(point.outbound) }"
          :title="`Enviadas: ${point.outbound}`"
        />
        <div
          class="w-[42%] rounded-t-md bg-brand-coral/80 transition-all"
          :style="{ height: barHeight(point.inbound) }"
          :title="`Recebidas: ${point.inbound}`"
        />
      </div>
      <span class="truncate text-[10px] font-medium text-brand-gray">{{ dayLabel(point.date) }}</span>
    </div>
  </div>
</template>

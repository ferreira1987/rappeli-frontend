<script setup lang="ts">
import { computed } from 'vue'

import type { NormalizedConversationVolumePoint } from '@/utils/reportConversationVolume'

const props = defineProps<{
  points: NormalizedConversationVolumePoint[]
}>()

const maxValue = computed(() => {
  let max = 1
  for (const point of props.points) {
    max = Math.max(max, point.handled, point.resolved)
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
      v-for="point in points"
      :key="point.date"
      class="flex min-w-0 flex-1 flex-col items-center gap-1"
    >
      <div class="flex h-40 w-full items-end justify-center gap-1">
        <div
          class="w-[42%] rounded-t-md bg-brand-indigo transition-all"
          :style="{ height: barHeight(point.handled) }"
          :title="`Atendidas: ${point.handled}`"
        />
        <div
          class="w-[42%] rounded-t-md bg-slate-300 transition-all"
          :style="{ height: barHeight(point.resolved) }"
          :title="`Resolvidas: ${point.resolved}`"
        />
      </div>
      <span class="truncate text-[10px] font-medium capitalize text-brand-gray">{{
        dayLabel(point.date)
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check } from '@lucide/vue'
import { computed } from 'vue'

const props = defineProps<{
  currentStep: 1 | 2 | 3 | 4
}>()

const steps = [
  { n: 1, label: 'Cadastro' },
  { n: 2, label: 'Plano' },
  { n: 3, label: 'Pagamento' },
  { n: 4, label: 'Ativação' },
] as const

const progressRatio = computed(() => {
  if (props.currentStep <= 1) {
    return 0
  }
  return (props.currentStep - 1) / (steps.length - 1)
})
</script>

<template>
  <nav aria-label="Progresso da contratação" class="w-full">
    <div class="relative mx-auto max-w-[720px]">
      <div
        class="absolute left-[12.5%] right-[12.5%] top-3.5 -z-0 h-0.5 bg-slate-200"
        aria-hidden="true"
      >
        <div
          class="h-full bg-emerald-500 transition-all duration-300"
          :style="{ width: `${progressRatio * 100}%` }"
        />
      </div>
      <ol class="grid grid-cols-4">
        <li v-for="step in steps" :key="step.n" class="flex flex-col items-center">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-full text-xs shadow-sm ring-4 ring-[#faf8ff]"
            :class="
              step.n < currentStep
                ? 'bg-emerald-500 text-white'
                : step.n === currentStep
                  ? 'bg-brand-indigo font-bold text-white'
                  : 'border border-slate-300 bg-white font-semibold text-slate-500'
            "
          >
            <Check v-if="step.n < currentStep" class="h-4 w-4" aria-hidden="true" />
            <span v-else>{{ step.n }}</span>
          </div>
          <span
            class="mt-2 text-center text-xs"
            :class="
              step.n === currentStep
                ? 'font-bold text-brand-indigo'
                : step.n < currentStep
                  ? 'font-medium text-slate-600'
                  : 'text-slate-500'
            "
          >
            {{ step.n }} {{ step.label }}
          </span>
        </li>
      </ol>
    </div>
  </nav>
</template>

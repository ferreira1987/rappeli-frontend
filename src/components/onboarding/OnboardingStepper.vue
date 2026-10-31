<script setup lang="ts">
import { Check, ChevronRight } from '@lucide/vue'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    currentStep: 1 | 2 | 3 | 4
    variant?: 'default' | 'inline-v5'
  }>(),
  {
    variant: 'default',
  },
)

const steps = [
  { n: 1, label: 'Cadastro' },
  { n: 2, label: 'Plano' },
  { n: 3, label: 'Pagamento' },
  { n: 4, label: 'Ativação' },
] as const

/** Fraction of the connector track filled with completed (green) color. */
const completedTrackRatio = computed(() => {
  if (props.currentStep <= 1) {
    return 0
  }
  return (props.currentStep - 1) / (steps.length - 1)
})
</script>

<template>
  <nav
    v-if="variant === 'inline-v5'"
    aria-label="Progresso da contratação"
    class="w-full overflow-x-auto"
  >
    <ol class="flex min-w-max items-center justify-center gap-1 sm:gap-2">
      <template v-for="(step, index) in steps" :key="step.n">
        <li
          class="flex flex-col items-center px-1 sm:px-2"
          :class="step.n === currentStep ? 'text-[#4338CA]' : 'text-slate-400'"
        >
          <span
            class="flex items-center gap-1.5 text-xs font-medium sm:text-sm"
            :class="step.n === currentStep ? 'font-semibold text-[#4338CA]' : 'text-slate-500'"
          >
            <span
              class="tabular-nums"
              :class="step.n === currentStep ? 'font-bold' : 'font-medium'"
            >
              {{ step.n }}
            </span>
            {{ step.label }}
          </span>
          <span
            class="mt-1.5 block h-0.5 w-full min-w-[3.5rem] rounded-full sm:min-w-[4.5rem]"
            :class="step.n === currentStep ? 'bg-[#4338CA]' : 'bg-transparent'"
            aria-hidden="true"
          />
        </li>
        <li v-if="index < steps.length - 1" class="flex shrink-0 items-center pb-3 text-slate-300">
          <ChevronRight class="h-4 w-4" aria-hidden="true" />
        </li>
      </template>
    </ol>
  </nav>

  <nav v-else aria-label="Progresso da contratação" class="w-full">
    <div class="relative mx-auto max-w-[720px]">
      <ol class="relative grid grid-cols-4">
        <!-- Connector track sits behind circles, vertically centered on 28px nodes -->
        <div
          class="pointer-events-none absolute left-[12.5%] right-[12.5%] top-3.5 z-0 h-0.5 -translate-y-1/2"
          aria-hidden="true"
        >
          <div class="relative h-full w-full rounded-full bg-slate-200">
            <div
              class="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all duration-300"
              :style="{ width: `${completedTrackRatio * 100}%` }"
            />
          </div>
        </div>

        <li v-for="step in steps" :key="step.n" class="relative z-10 flex flex-col items-center">
          <div
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs leading-none"
            :class="
              step.n < currentStep
                ? 'bg-emerald-500 text-white shadow-sm'
                : step.n === currentStep
                  ? 'bg-brand-indigo text-sm font-bold text-white shadow-sm'
                  : 'border border-slate-300 bg-white text-sm font-semibold text-slate-500'
            "
          >
            <Check
              v-if="step.n < currentStep"
              class="h-4 w-4 shrink-0"
              stroke-width="2.5"
              aria-hidden="true"
            />
            <span v-else class="select-none tabular-nums">{{ step.n }}</span>
          </div>
          <span
            class="mt-2 w-full text-center text-xs leading-tight"
            :class="
              step.n === currentStep
                ? 'font-bold text-brand-indigo'
                : step.n < currentStep
                  ? 'font-medium text-slate-600'
                  : 'font-normal text-slate-500'
            "
          >
            {{ step.label }}
          </span>
        </li>
      </ol>
    </div>
  </nav>
</template>

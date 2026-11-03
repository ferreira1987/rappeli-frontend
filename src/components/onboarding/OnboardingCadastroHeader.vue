<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import { RouterLink } from 'vue-router'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'
import OnboardingStepper from '@/components/onboarding/OnboardingStepper.vue'
import { useAuthStore } from '@/stores/auth'

withDefaults(
  defineProps<{
    step: 1 | 2 | 3 | 4
    /** Plano, Pagamento e Ativação (steps 2–4): voltar no topo e indicador Passo X de 4. */
    planStepLayout?: boolean
  }>(),
  {
    planStepLayout: false,
  },
)

const emit = defineEmits<{
  back: []
}>()

const auth = useAuthStore()
</script>

<template>
  <header class="w-full border-b border-slate-200/80 bg-[#F8FAFC]">
    <div class="mx-auto max-w-6xl px-4 md:px-8">
      <div
        class="flex flex-col gap-4 py-4 sm:grid sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6 sm:py-5"
      >
        <div class="flex min-w-0 shrink-0 items-center gap-3 sm:gap-4">
          <RappeliLogo variant="dark" mode="horizontal" class="h-10 w-auto sm:h-11" />
          <button
            v-if="planStepLayout"
            type="button"
            class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-brand-indigo"
            @click="emit('back')"
          >
            <ArrowLeft class="h-4 w-4 shrink-0" aria-hidden="true" />
            Voltar
          </button>
          <RouterLink
            v-else-if="auth.isAuthenticated"
            :to="{ name: 'painel' }"
            class="hidden text-xs font-semibold text-brand-indigo hover:underline sm:inline"
          >
            Voltar ao painel
          </RouterLink>
        </div>

        <div class="min-w-0 sm:justify-self-center">
          <OnboardingStepper variant="inline-v5" :current-step="step" />
        </div>

        <span
          v-if="planStepLayout"
          class="shrink-0 text-xs font-medium text-slate-500 sm:text-sm sm:justify-self-end"
        >
          Passo {{ step }} de 4
        </span>
        <RouterLink
          v-else
          :to="{ name: 'login' }"
          class="shrink-0 text-sm font-medium text-slate-600 hover:text-brand-indigo sm:justify-self-end"
        >
          Já tenho conta
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import OnboardingCadastroHeader from '@/components/onboarding/OnboardingCadastroHeader.vue'
import OnboardingFooter from '@/components/onboarding/OnboardingFooter.vue'
import OnboardingHeader from '@/components/onboarding/OnboardingHeader.vue'
import OnboardingStepper from '@/components/onboarding/OnboardingStepper.vue'

withDefaults(
  defineProps<{
    step: 1 | 2 | 3 | 4
    wide?: boolean
    /** v5 Stitch layout for etapa Cadastro (step 1 only). */
    shellVariant?: 'default' | 'cadastro-v5'
  }>(),
  {
    shellVariant: 'default',
  },
)
</script>

<template>
  <div
    class="flex min-h-screen flex-col text-brand-ink"
    :class="shellVariant === 'cadastro-v5' ? 'bg-[#F8FAFC]' : 'bg-[#faf8ff]'"
  >
    <OnboardingCadastroHeader v-if="shellVariant === 'cadastro-v5'" :step="step" />
    <template v-else>
      <OnboardingHeader />
      <div class="w-full">
        <div class="mx-auto max-w-6xl px-4 py-6 md:px-8">
          <div class="mx-auto w-full max-w-[720px]">
            <OnboardingStepper :current-step="step" />
          </div>
        </div>
      </div>
    </template>
    <main
      class="mx-auto w-full flex-1 px-4 md:px-8"
      :class="[
        shellVariant === 'cadastro-v5' ? 'max-w-6xl py-6 sm:py-8' : 'max-w-6xl py-8',
        wide && shellVariant !== 'cadastro-v5' ? 'max-w-7xl' : '',
      ]"
    >
      <slot />
    </main>
    <slot name="action-bar" />
    <OnboardingFooter :muted="shellVariant === 'cadastro-v5'" />
  </div>
</template>

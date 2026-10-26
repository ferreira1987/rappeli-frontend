<script setup lang="ts">
import OnboardingFooter from '@/components/onboarding/OnboardingFooter.vue'
import OnboardingHeader from '@/components/onboarding/OnboardingHeader.vue'
import OnboardingStepper from '@/components/onboarding/OnboardingStepper.vue'

defineProps<{
  step: 1 | 2 | 3 | 4
  wide?: boolean
}>()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[#faf8ff] text-brand-ink">
    <OnboardingHeader />
    <div class="w-full border-b border-slate-200 bg-white">
      <div class="mx-auto max-w-6xl px-4 py-6 md:px-8">
        <div class="mx-auto w-full max-w-[720px]">
          <OnboardingStepper :current-step="step" />
        </div>
      </div>
    </div>
    <main
      class="mx-auto w-full flex-1 px-4 py-8 md:px-8"
      :class="wide ? 'max-w-7xl' : 'max-w-6xl'"
    >
      <slot />
    </main>
    <slot name="action-bar" />
    <OnboardingFooter />
  </div>
</template>

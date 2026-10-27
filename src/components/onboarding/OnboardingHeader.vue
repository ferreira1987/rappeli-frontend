<script setup lang="ts">
import { Lock, MessageCircle } from '@lucide/vue'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'
import { WHATSAPP_HELP_URL } from '@/constants/onboardingPlans'
</script>

<template>
  <header class="w-full bg-white shadow-sm">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
      <RappeliLogo variant="dark" mode="horizontal" class="h-12 w-auto shrink-0" />
      <div class="flex shrink-0 items-center gap-3">
        <div
          class="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
        >
          <Lock class="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          Ambiente seguro
        </div>
        <a
          :href="WHATSAPP_HELP_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <MessageCircle class="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
          <span class="whitespace-nowrap">Ajuda no WhatsApp</span>
        </a>
      </div>
    </div>
  </header>
</template>

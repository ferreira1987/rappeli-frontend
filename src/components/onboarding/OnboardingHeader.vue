<script setup lang="ts">
import { Lock, MessageCircle } from '@lucide/vue'

import { WHATSAPP_HELP_URL } from '@/constants/onboardingPlans'
</script>

<template>
  <header class="w-full border-b border-slate-200 bg-white shadow-sm">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
      <div class="flex min-w-0 items-center gap-2.5">
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-indigo text-base font-bold leading-none text-white shadow-sm"
          aria-hidden="true"
        >
          R
        </div>
        <span class="text-[20px] font-semibold leading-none tracking-tight text-brand-indigo">
          Rappeli
        </span>
      </div>
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

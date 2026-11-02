<script setup lang="ts">
import { ArrowRight, CircleHelp } from '@lucide/vue'

import {
  brandPrivacyUrl,
  brandSiteUrl,
  brandSupportMailto,
  brandTermsUrl,
} from '@/constants/brandUrls'

withDefaults(
  defineProps<{
    hideTop?: boolean
  }>(),
  { hideTop: false },
)
</script>

<template>
  <div>
    <div
      v-if="!hideTop"
      class="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-10"
    >
      <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 sm:gap-4 sm:text-sm">
        <a
          :href="brandSiteUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 transition-colors hover:text-slate-800"
        >
          <CircleHelp class="h-4 w-4" aria-hidden="true" />
          Ajuda
        </a>
        <a
          :href="brandSupportMailto"
          class="inline-flex items-center gap-1 transition-colors hover:text-slate-800"
        >
          Falar com suporte
          <ArrowRight class="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </div>

    <slot />

    <footer
      class="flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 px-4 py-4 text-center text-xs text-slate-400 sm:flex-row sm:text-left lg:px-12"
    >
      <span>© {{ new Date().getFullYear() }} Rappeli Tecnologia Ltda.</span>
      <div class="flex gap-4">
        <a :href="brandTermsUrl" target="_blank" rel="noopener noreferrer" class="hover:text-slate-600">
          Termos de Uso
        </a>
        <a
          :href="brandPrivacyUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-slate-600"
        >
          Política de Privacidade
        </a>
      </div>
    </footer>
  </div>
</template>

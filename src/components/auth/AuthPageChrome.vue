<script setup lang="ts">
import { ArrowRight, CircleHelp } from '@lucide/vue'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'

const termsUrl = 'https://rappeli.com.br/termos'
const privacyUrl = 'https://rappeli.com.br/privacidade'
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
    <RappeliLogo variant="dark" class="lg:hidden" />
    <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 sm:gap-4 sm:text-sm">
      <a href="#" class="inline-flex items-center gap-1 hover:text-slate-800" @click.prevent>
        <CircleHelp class="h-4 w-4" />
        Ajuda
      </a>
      <a href="#" class="inline-flex items-center gap-1 hover:text-slate-800" @click.prevent>
        Falar com suporte
        <ArrowRight class="h-4 w-4" />
      </a>
    </div>
  </div>

  <slot />

  <footer
    class="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 text-center text-[11px] text-slate-400 sm:flex-row sm:text-left lg:px-10"
  >
    <span>© {{ new Date().getFullYear() }} Rappeli. Todos os direitos reservados.</span>
    <div class="flex gap-4">
      <a :href="termsUrl" target="_blank" rel="noopener noreferrer">Termos de Uso</a>
      <a :href="privacyUrl" target="_blank" rel="noopener noreferrer">Privacidade</a>
      <a href="#" @click.prevent>Contato</a>
    </div>
  </footer>
</template>

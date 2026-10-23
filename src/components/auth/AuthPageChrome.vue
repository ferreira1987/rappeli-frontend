<script setup lang="ts">
import { ArrowRight, CircleHelp } from '@lucide/vue'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'

const termsUrl = 'https://rappeli.com.br/termos'
const privacyUrl = 'https://rappeli.com.br/privacidade'
</script>

<template>
  <div class="flex items-center justify-between px-6 py-5 lg:px-10">
    <RappeliLogo variant="dark" class="lg:hidden" />
    <div class="ml-auto flex items-center gap-4 text-sm text-slate-500">
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
    class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-6 py-4 text-[11px] text-slate-400 lg:px-10"
  >
    <span>© {{ new Date().getFullYear() }} Rappeli. Todos os direitos reservados.</span>
    <div class="flex gap-4">
      <a :href="termsUrl" target="_blank" rel="noopener noreferrer">Termos de Uso</a>
      <a :href="privacyUrl" target="_blank" rel="noopener noreferrer">Privacidade</a>
      <a href="#" @click.prevent>Contato</a>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ArrowLeft, HelpCircle, Link2Off, RefreshCw } from '@lucide/vue'
import { RouterLink } from 'vue-router'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'

const termsUrl = 'https://rappeli.com.br/termos'
const privacyUrl = 'https://rappeli.com.br/privacidade'
</script>

<template>
  <div class="flex min-h-screen flex-col justify-between bg-[#f5f6ff] text-brand-ink">
    <header class="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 md:px-8">
      <RouterLink :to="{ name: 'painel' }" class="flex items-center gap-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-indigo text-white">
          <RappeliLogo mode="symbol" variant="light" class="h-5 w-5" />
        </div>
        <span class="font-display text-xl font-bold tracking-tight text-brand-indigo">Rappeli</span>
      </RouterLink>
      <a
        href="#"
        class="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-indigo"
        @click.prevent
      >
        <HelpCircle class="h-4 w-4" aria-hidden="true" />
        Central de Ajuda
      </a>
    </header>

    <main class="flex flex-1 items-center justify-center px-4 py-10">
      <div
        class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10"
      >
        <div
          class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-mist text-brand-indigo"
        >
          <Link2Off class="h-8 w-8" aria-hidden="true" />
        </div>
        <div class="mb-2 inline-flex rounded-full bg-brand-mist px-3 py-1">
          <span class="text-xs font-semibold tracking-wide text-brand-indigo">ERRO 404</span>
        </div>
        <h1 class="font-display text-2xl font-bold text-brand-ink">Página não encontrada</h1>
        <p class="mt-2 text-sm text-brand-gray">
          O endereço que você acessou não existe ou foi movido.
        </p>

        <div class="mt-8 flex flex-col gap-3">
          <RouterLink
            :to="{ name: 'painel' }"
            class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-indigo text-sm font-semibold text-white shadow-sm hover:bg-brand-indigo-hover"
          >
            <ArrowLeft class="h-4 w-4" aria-hidden="true" />
            Voltar ao painel
          </RouterLink>
          <div class="flex items-center justify-center gap-4 pt-1 text-xs text-brand-gray">
            <a href="#" class="inline-flex items-center gap-1 hover:text-brand-indigo" @click.prevent>
              Falar com suporte
            </a>
            <span class="text-slate-300">•</span>
            <a href="#" class="inline-flex items-center gap-1 hover:text-brand-indigo" @click.prevent>
              <RefreshCw class="h-3.5 w-3.5" aria-hidden="true" />
              Status da plataforma
            </a>
          </div>
        </div>
      </div>
    </main>

    <footer
      class="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-6 text-xs text-brand-gray sm:flex-row md:px-8"
    >
      <p>© {{ new Date().getFullYear() }} Rappeli</p>
      <div class="flex gap-6">
        <a :href="termsUrl" target="_blank" rel="noopener noreferrer" class="hover:text-brand-indigo">
          Termos de Uso
        </a>
        <a :href="privacyUrl" target="_blank" rel="noopener noreferrer" class="hover:text-brand-indigo">
          Política de Privacidade
        </a>
      </div>
    </footer>
  </div>
</template>

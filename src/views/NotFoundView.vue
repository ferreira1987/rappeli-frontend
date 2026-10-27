<script setup lang="ts">
import { RouterLink } from 'vue-router'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-brand-mist px-4 text-center">
    <RappeliLogo variant="dark" class="mb-6" />
    <h1 class="font-display text-2xl font-bold text-brand-ink">Página não encontrada</h1>
    <p class="mt-2 max-w-md text-sm text-brand-gray">
      O endereço que você acessou não existe ou foi movido.
    </p>
    <RouterLink
      :to="{ name: 'painel' }"
      class="mt-6 inline-flex rounded-xl bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
    >
      Voltar ao painel
    </RouterLink>
  </div>
</template>

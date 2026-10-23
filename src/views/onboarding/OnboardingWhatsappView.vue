<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  Cloud,
  GitBranch,
  Lightbulb,
  QrCode,
  RefreshCw,
  Smartphone,
  Users,
  Zap,
} from '@lucide/vue'
import { RouterLink } from 'vue-router'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'

const steps = [
  { n: 1, label: 'Dados da empresa', done: true },
  { n: 2, label: 'Conectar WhatsApp', active: true },
  { n: 3, label: 'Primeira automação', done: false },
]
</script>

<template>
  <div class="min-h-screen bg-brand-mist">
    <header class="border-b border-slate-200/80 bg-white px-6 py-4">
      <RappeliLogo />
    </header>

    <div class="mx-auto max-w-5xl px-6 py-8">
      <ol class="flex items-center justify-center gap-2 text-sm md:gap-4">
        <li v-for="(step, idx) in steps" :key="step.n" class="flex items-center gap-2">
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
            :class="
              step.done
                ? 'bg-emerald-500 text-white'
                : step.active
                  ? 'bg-brand-indigo text-white'
                  : 'bg-slate-200 text-brand-gray'
            "
          >
            {{ step.done ? '✓' : step.n }}
          </span>
          <span
            class="hidden font-medium sm:inline"
            :class="step.active ? 'text-brand-indigo' : 'text-brand-gray'"
          >
            {{ step.label }}
          </span>
          <span v-if="idx < steps.length - 1" class="hidden h-px w-8 bg-slate-200 sm:block" />
        </li>
      </ol>

      <div class="mt-10 text-center">
        <span class="inline-flex items-center gap-2 rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold text-brand-indigo">
          <span class="h-2 w-2 rounded-full bg-brand-coral" />
          Etapa 2 de 3 · Configuração de canal
        </span>
        <h1 class="mt-4 font-display text-3xl font-bold text-brand-ink">Conecte seu WhatsApp ao Rappeli</h1>
        <p class="mx-auto mt-3 max-w-2xl text-sm text-brand-gray">
          Escolha o método de conexão. Nenhum canal será ativado até você concluir a integração na API.
        </p>
      </div>

      <div class="mt-10 grid gap-6 lg:grid-cols-2">
        <article class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-2 text-xs font-medium text-brand-indigo">
            <QrCode class="h-4 w-4" />
            QR Code
          </div>
          <h2 class="mt-2 font-display text-lg font-semibold text-brand-ink">Escanear QR Code</h2>
          <p class="mt-2 text-sm text-brand-gray">Ideal para testes rápidos com o app WhatsApp no celular.</p>
          <div
            class="mt-6 flex aspect-square max-h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-brand-gray"
          >
            QR Code (aguardando API)
          </div>
          <p class="mt-3 flex items-center justify-center gap-2 text-xs text-brand-gray">
            <span class="h-2 w-2 rounded-full bg-brand-coral" />
            Aguardando conexão
          </p>
          <ol class="mt-6 space-y-2 rounded-xl bg-slate-50 p-4 text-xs text-brand-gray">
            <li class="flex gap-2"><Smartphone class="h-4 w-4 shrink-0" /> Abra o WhatsApp no smartphone</li>
            <li>1. Menu → Aparelhos conectados</li>
            <li>2. Conectar um aparelho</li>
            <li>3. Escaneie o código quando disponível</li>
          </ol>
          <button type="button" disabled class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-indigo">
            <RefreshCw class="h-4 w-4" />
            Recarregar código QR
          </button>
        </article>

        <article class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-2 text-xs font-medium text-brand-indigo">
            <GitBranch class="h-4 w-4" />
            Conexão direta API
          </div>
          <h2 class="mt-2 font-display text-lg font-semibold text-brand-ink">WhatsApp Business API</h2>
          <p class="mt-2 text-sm text-brand-gray">Recomendado para produção — sem depender de celular ligado.</p>
          <ul class="mt-6 space-y-3">
            <li class="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm">
              <Cloud class="h-5 w-5 shrink-0 text-brand-indigo" />
              <span class="text-brand-gray">Linha corporativa na nuvem</span>
            </li>
            <li class="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm">
              <Users class="h-5 w-5 shrink-0 text-brand-indigo" />
              <span class="text-brand-gray">Multiusuário centralizado</span>
            </li>
            <li class="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm">
              <Zap class="h-5 w-5 shrink-0 text-brand-indigo" />
              <span class="text-brand-gray">Envios automatizados</span>
            </li>
          </ul>
          <button type="button" disabled class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-indigo py-3 text-sm font-semibold text-white opacity-60">
            Conectar WhatsApp Business API
          </button>
        </article>
      </div>

      <div class="mt-8 flex items-start gap-3 rounded-2xl bg-brand-mist p-4 text-sm text-brand-ink">
        <Lightbulb class="h-5 w-5 shrink-0 text-brand-indigo" />
        <p>
          Você pode iniciar com QR Code e migrar para a API depois em
          <RouterLink :to="{ name: 'configuracoes' }" class="font-medium text-brand-indigo hover:underline">
            Configurações → WhatsApp
          </RouterLink>.
        </p>
      </div>

      <footer class="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
        <RouterLink
          :to="{ name: 'painel' }"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-brand-gray"
        >
          <ArrowLeft class="h-4 w-4" />
          Voltar
        </RouterLink>
        <button type="button" class="text-sm text-brand-gray" disabled>Pular e configurar mais tarde</button>
        <span class="text-xs text-brand-gray">Nenhum canal conectado</span>
        <RouterLink
          :to="{ name: 'painel' }"
          class="inline-flex items-center gap-2 rounded-xl bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white"
        >
          Continuar
          <ArrowRight class="h-4 w-4" />
        </RouterLink>
      </footer>
    </div>
  </div>
</template>

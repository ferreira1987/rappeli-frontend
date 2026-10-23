<script setup lang="ts">
import {
  BookOpen,
  CircleHelp,
  GitBranch,
  Headphones,
  HelpCircle,
  MessageCircle,
  Play,
  Plus,
  Save,
  Tag,
  Zap,
} from '@lucide/vue'
import { RouterLink } from 'vue-router'

import ExampleDataBanner from '@/components/app/ExampleDataBanner.vue'
import RappeliLogo from '@/components/brand/RappeliLogo.vue'

const blockCategories = [
  { label: 'Gatilhos & disparos', icon: Zap, active: true },
  { label: 'Mensagens WhatsApp', icon: MessageCircle },
  { label: 'Lógica & condições', icon: GitBranch },
  { label: 'Ações & tags', icon: Tag },
  { label: 'Atendimento', icon: Headphones },
]

const nodes = [
  { type: 'Gatilho', title: 'Evento de exemplo', hint: 'Defina o gatilho na API.' },
  { type: 'Aguardar', title: 'Aguardar —', hint: 'Intervalo configurável.' },
  { type: 'Condição', title: 'Cliente respondeu?', hint: 'Ramificação ilustrativa.' },
  { type: 'WhatsApp', title: 'Mensagem de exemplo', hint: 'Template sem variáveis reais.' },
]
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-100">
    <header class="border-b border-slate-200 bg-white">
      <div class="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <RappeliLogo />
        <nav class="hidden items-center gap-6 text-sm font-medium text-brand-gray md:flex">
          <RouterLink to="/painel" class="hover:text-brand-ink">Painel</RouterLink>
          <RouterLink to="/conversas" class="hover:text-brand-ink">Conversas</RouterLink>
          <span class="text-brand-indigo">Automações</span>
          <RouterLink to="/contatos" class="hover:text-brand-ink">Contatos</RouterLink>
          <RouterLink to="/configuracoes" class="hover:text-brand-ink">Configurações</RouterLink>
        </nav>
        <CircleHelp class="h-5 w-5 text-brand-gray" />
      </div>
      <div class="flex flex-wrap items-center gap-3 border-t border-slate-100 px-4 py-3 lg:px-6">
        <p class="text-sm text-brand-gray">
          Automações /
          <span class="font-medium text-brand-ink">Fluxo de exemplo</span>
        </p>
        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-brand-gray">Rascunho</span>
        <div class="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:flex-wrap">
          <button type="button" disabled class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-brand-gray">
            <Play class="h-4 w-4" />
            Testar
          </button>
          <button type="button" disabled class="inline-flex items-center gap-2 rounded-xl bg-brand-indigo px-4 py-2 text-sm font-semibold text-white opacity-60">
            <Save class="h-4 w-4" />
            Salvar automação
          </button>
        </div>
      </div>
    </header>

    <ExampleDataBanner class="mx-4 mt-4 lg:mx-6" />

    <div class="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_1fr_320px]">
      <aside class="border-r border-slate-200 bg-white p-4">
        <h2 class="text-sm font-semibold text-brand-ink">Blocos de fluxo</h2>
        <p class="text-xs text-brand-gray">Arraste para o canvas (em breve)</p>
        <ul class="mt-4 space-y-1">
          <li v-for="cat in blockCategories" :key="cat.label">
            <button
              type="button"
              disabled
              class="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm"
              :class="cat.active ? 'bg-brand-mist text-brand-indigo' : 'text-brand-gray'"
            >
              <component :is="cat.icon" class="h-4 w-4" />
              {{ cat.label }}
            </button>
          </li>
        </ul>
        <button type="button" disabled class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-mist py-2.5 text-sm font-medium text-brand-indigo">
          <Plus class="h-4 w-4" />
          Novo bloco
        </button>
        <div class="mt-8 space-y-2 text-xs text-brand-gray">
          <p class="flex items-center gap-2"><BookOpen class="h-3.5 w-3.5" /> Biblioteca de modelos</p>
          <p class="flex items-center gap-2"><HelpCircle class="h-3.5 w-3.5" /> Documentação</p>
        </div>
      </aside>

      <main class="overflow-auto bg-[radial-gradient(circle,_#cbd5e1_1px,_transparent_1px)] bg-[length:20px_20px] p-6">
        <div class="mx-auto flex max-w-md flex-col items-center gap-3">
          <div
            v-for="(node, idx) in nodes"
            :key="idx"
            class="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            :class="idx === 0 ? 'border-brand-coral/50' : ''"
          >
            <p class="text-[10px] font-bold uppercase tracking-wide text-brand-gray">{{ node.type }}</p>
            <p class="mt-1 font-display font-semibold text-brand-ink">{{ node.title }}</p>
            <p class="mt-1 text-xs text-brand-gray">{{ node.hint }}</p>
          </div>
          <p v-if="nodes.length" class="text-xs text-brand-gray">↓</p>
        </div>
      </main>

      <aside class="border-l border-slate-200 bg-white p-4">
        <h2 class="text-sm font-semibold text-brand-ink">Propriedades do nó</h2>
        <p class="mt-4 text-sm text-brand-gray">Selecione um bloco no canvas para editar (interação futura).</p>
        <label class="mt-6 block text-xs font-semibold uppercase text-brand-gray">Conteúdo do WhatsApp</label>
        <textarea
          disabled
          rows="5"
          class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-brand-gray"
          placeholder="Mensagem de exemplo…"
        />
        <div class="mt-6 flex gap-2">
          <button type="button" disabled class="flex-1 rounded-xl border border-red-200 py-2 text-sm text-red-600">
            Excluir bloco
          </button>
          <button type="button" disabled class="flex-1 rounded-xl bg-brand-indigo py-2 text-sm font-semibold text-white opacity-60">
            Aplicar
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

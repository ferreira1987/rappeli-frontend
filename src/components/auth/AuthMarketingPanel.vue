<script setup lang="ts">
import { Bell, Headphones, MessageCircle } from '@lucide/vue'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'
</script>

<template>
  <section
    class="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-ink via-[#14123a] to-brand-indigo px-10 py-10 text-white lg:flex lg:w-[42%] xl:w-[40%]"
  >
    <div>
      <div class="flex items-center gap-3">
        <RappeliLogo mode="symbol" />
        <span class="font-display text-2xl font-semibold tracking-tight text-white">rappeli</span>
      </div>
      <p
        class="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-wider text-indigo-100"
      >
        <span class="h-2 w-2 rounded-full bg-brand-coral" aria-hidden="true" />
        AUTOMAÇÃO WHATSAPP PARA EMPRESAS
      </p>
      <h2 class="mt-8 max-w-md font-display text-3xl font-bold leading-tight">
        Automatize atendimento, lembretes e confirmações da sua empresa
      </h2>
      <p class="mt-4 max-w-md text-sm leading-relaxed text-indigo-100/90">
        Reduza tarefas repetitivas na recepção, envie atualizações em tempo real e mantenha seus
        clientes informados pelo WhatsApp.
      </p>

      <ul class="mt-10 space-y-6">
        <li class="flex gap-4">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-indigo-200"
          >
            <Bell class="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p class="font-semibold">Lembretes automáticos</p>
            <p class="mt-1 text-sm text-indigo-100/80">
              Programe avisos de compromissos, prazos e retornos sem depender de planilhas.
            </p>
          </div>
        </li>
        <li class="flex gap-4">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-indigo-200"
          >
            <MessageCircle class="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p class="font-semibold">Confirmações e notificações</p>
            <p class="mt-1 text-sm text-indigo-100/80">
              Informe clientes sobre confirmações, status de pedidos e novidades relevantes.
            </p>
          </div>
        </li>
        <li class="flex gap-4">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-indigo-200"
          >
            <Headphones class="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p class="font-semibold">Menos respostas repetitivas</p>
            <p class="mt-1 text-sm text-indigo-100/80">
              Atendimento inicial e confirmações automáticas para sua equipe focar no essencial.
            </p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

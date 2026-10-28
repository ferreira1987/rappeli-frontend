<script setup lang="ts">
import { Bell, Headphones, MessageCircle } from '@lucide/vue'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'
</script>

<template>
  <aside
    class="relative hidden w-full shrink-0 flex-col justify-between overflow-y-auto bg-brand-indigo p-8 text-white sm:p-12 lg:flex lg:w-[46%] lg:p-16"
    style="background-color: #4338ca"
  >
    <div>
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10"
        >
          <RappeliLogo mode="symbol" class="h-5 w-5" />
        </div>
        <div>
          <span class="block font-display text-2xl font-bold leading-none tracking-tight text-white">
            Rappeli
          </span>
          <span class="mt-1 block text-xs text-white/80">Mensagens &amp; automações</span>
        </div>
      </div>

      <div class="my-auto space-y-6 py-8">
        <div class="space-y-3">
          <h2 class="max-w-md font-display text-2xl font-extrabold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl">
            Automatize atendimento, lembretes e confirmações da sua empresa.
          </h2>
          <p class="max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
            Reduza tarefas repetitivas na recepção, envie atualizações em tempo real e mantenha seus
            clientes informados pelo WhatsApp.
          </p>
        </div>

        <div class="space-y-3 pt-2">
          <div
            class="flex items-start gap-3 rounded-lg border border-white/10 bg-white/10 p-3 text-white"
          >
            <div
              class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15"
            >
              <Bell class="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <p class="text-xs leading-snug text-white/95 sm:text-sm">
              <strong class="font-semibold text-white">Lembretes automáticos</strong> — Programe avisos
              de compromissos, prazos e retornos sem depender de planilhas.
            </p>
          </div>
          <div
            class="flex items-start gap-3 rounded-lg border border-white/10 bg-white/10 p-3 text-white"
          >
            <div
              class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15"
            >
              <MessageCircle class="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <p class="text-xs leading-snug text-white/95 sm:text-sm">
              <strong class="font-semibold text-white">Confirmações e notificações</strong> — Notifique
              clientes sobre status, horários e novidades relevantes.
            </p>
          </div>
          <div
            class="flex items-start gap-3 rounded-lg border border-white/10 bg-white/10 p-3 text-white"
          >
            <div
              class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15"
            >
              <Headphones class="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <p class="text-xs leading-snug text-white/95 sm:text-sm">
              <strong class="font-semibold text-white">Menos respostas repetitivas</strong> — Atendimento
              inicial e triagem automática para sua equipe focar no essencial.
            </p>
          </div>
        </div>
      </div>
    </div>

    <footer class="pt-6">
      <p class="text-xs text-white/70">© {{ new Date().getFullYear() }} Rappeli. Todos os direitos reservados.</p>
    </footer>
  </aside>
</template>

<script setup lang="ts">
import { Check } from '@lucide/vue'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'

const featureItems = [
  {
    title: 'Lembretes automáticos',
    detail:
      'Programe avisos de compromissos, prazos e retornos sem depender de planilhas.',
  },
  {
    title: 'Confirmações e notificações',
    detail:
      'Notifique clientes sobre status, horários e novidades relevantes.',
  },
  {
    title: 'Menos respostas repetitivas',
    detail:
      'Atendimento inicial e triagem automática para sua equipe focar no essencial.',
  },
] as const
</script>

<template>
  <aside
    class="relative hidden min-h-screen w-full shrink-0 flex-col justify-between overflow-y-auto bg-[#4338CA] p-8 text-white sm:p-12 lg:flex lg:w-[min(42%,520px)] lg:max-w-[520px] lg:p-14 xl:p-16"
  >
    <header class="flex items-center gap-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10"
      >
        <RappeliLogo mode="symbol" class="h-5 w-5" />
      </div>
      <div>
        <span class="block font-display text-2xl font-bold leading-none tracking-tight text-white">
          Rappeli
        </span>
        <span class="mt-1 block text-sm text-white/85">Mensagens &amp; automações</span>
      </div>
    </header>

    <div class="flex flex-1 flex-col justify-center py-10 lg:py-12">
      <div class="space-y-8">
        <div class="space-y-4">
          <h2
            class="max-w-md font-display text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl lg:text-[2rem] lg:leading-tight"
          >
            Automatize atendimento, lembretes e confirmações da sua empresa.
          </h2>
          <p class="max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
            Reduza tarefas repetitivas na recepção, envie atualizações em tempo real e mantenha seus
            clientes informados pelo WhatsApp.
          </p>
        </div>

        <ul class="max-w-md space-y-4">
          <li
            v-for="item in featureItems"
            :key="item.title"
            class="flex items-start gap-3 text-sm leading-snug text-white sm:text-[0.9375rem]"
          >
            <span
              class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10"
              aria-hidden="true"
            >
              <Check class="h-3.5 w-3.5 text-white" stroke-width="2.5" />
            </span>
            <span>
              <strong class="font-semibold text-white">{{ item.title }}</strong>
              — {{ item.detail }}
            </span>
          </li>
          <li class="flex items-start gap-3 text-sm leading-snug text-white/95 sm:text-[0.9375rem]">
            <span
              class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10"
              aria-hidden="true"
            >
              <Check class="h-3.5 w-3.5 text-white" stroke-width="2.5" />
            </span>
            <span>Atendimento em equipe num só lugar</span>
          </li>
        </ul>
      </div>
    </div>

    <footer>
      <p class="text-xs text-white/75">
        © {{ new Date().getFullYear() }} Rappeli. Todos os direitos reservados.
      </p>
    </footer>
  </aside>
</template>

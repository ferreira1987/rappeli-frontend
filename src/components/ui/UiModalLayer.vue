<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    /** id do elemento que titula o diálogo */
    labelledBy?: string
    describedBy?: string
    role?: 'dialog' | 'alertdialog'
    zClass?: string
    /** Permite scroll vertical quando o conteúdo é alto (ex.: agendar mensagem) */
    scrollable?: boolean
  }>(),
  {
    role: 'dialog',
    zClass: 'z-[60]',
    scrollable: false,
  },
)

defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="ui-modal">
      <div
        v-if="open"
        :class="[
          'fixed inset-0 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]',
          scrollable ? 'overflow-y-auto' : '',
          zClass,
        ]"
        :role="role"
        aria-modal="true"
        :aria-labelledby="labelledBy"
        :aria-describedby="describedBy"
        @click.self="$emit('close')"
      >
        <div class="ui-modal-panel w-full" @click.stop>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

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
    /** `sheet`: bottom sheet no mobile, centrado no sm+ */
    align?: 'center' | 'sheet'
    panelClass?: string
  }>(),
  {
    role: 'dialog',
    zClass: 'z-[60]',
    scrollable: false,
    align: 'center',
    panelClass: '',
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
          'fixed inset-0 flex justify-center bg-slate-900/50 backdrop-blur-[2px]',
          align === 'sheet' ? 'items-end p-0 sm:items-center sm:p-4' : 'items-center p-4',
          scrollable ? 'overflow-y-auto' : '',
          zClass,
        ]"
        :role="role"
        aria-modal="true"
        :aria-labelledby="labelledBy"
        :aria-describedby="describedBy"
        @click.self="$emit('close')"
      >
        <div class="ui-modal-panel w-full" :class="panelClass" @click.stop>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

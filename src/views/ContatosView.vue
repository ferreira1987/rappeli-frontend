<script setup lang="ts">
import { Loader2, Pencil, Plus, Search, Trash2, Upload, Users } from '@lucide/vue'
import { computed, onMounted, ref, watch } from 'vue'

import { createContact, deleteContact, fetchContacts, importContactsCsv, updateContact } from '@/api/contacts'
import AppConfirmModal from '@/components/app/AppConfirmModal.vue'
import EmptyState from '@/components/app/EmptyState.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiTable from '@/components/ui/UiTable.vue'
import { useEscapeKey } from '@/composables/useEscapeKey'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import type { Contact } from '@/types/contacts'
import { formatBrazilPhone, validateBrazilPhoneField } from '@/utils/phone'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'
import { pluralizePt } from '@/utils/pluralize'

const contacts = ref<Contact[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')
const searchDebounced = ref('')

const createOpen = ref(false)
const createName = ref('')
const createPhone = ref('')
const createOptIn = ref(false)
const createSubmitting = ref(false)
const createError = ref<string | null>(null)
const createFieldErrors = ref<Record<string, string>>({})

const importInput = ref<HTMLInputElement | null>(null)
const importMessage = ref<string | null>(null)
const importSubmitting = ref(false)

const editOpen = ref(false)
const editContactId = ref<number | null>(null)
const editName = ref('')
const editPhone = ref('')
const editOptIn = ref(false)
const editSubmitting = ref(false)
const editError = ref<string | null>(null)
const editFieldErrors = ref<Record<string, string>>({})

const deleteConfirmOpen = ref(false)
const contactPendingDelete = ref<Contact | null>(null)
const deleteSubmitting = ref(false)

const deleteConfirmMessage = computed(() => {
  if (!contactPendingDelete.value) return ''
  const label =
    contactPendingDelete.value.display_name ||
    formatBrazilPhone(contactPendingDelete.value.phone) ||
    contactPendingDelete.value.phone
  return `Excluir o contato "${label}"? Esta ação não pode ser desfeita.`
})

const listedCountLabel = computed(() =>
  pluralizePt(contacts.value.length, 'contato', {
    one: 'contato listado',
    other: 'contatos listados',
  }),
)

let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(search, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchDebounced.value = value.trim()
  }, 300)
})

const hasContacts = computed(() => contacts.value.length > 0)

async function loadContacts(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const page = await fetchContacts({
      search: searchDebounced.value || undefined,
      per_page: 100,
    })
    contacts.value = page.contacts
  } catch (err) {
    error.value = getErrorMessage(err)
    contacts.value = []
  } finally {
    loading.value = false
  }
}

watch(searchDebounced, () => {
  void loadContacts()
})

onMounted(() => {
  void loadContacts()
})

function openCreate(): void {
  createName.value = ''
  createPhone.value = ''
  createOptIn.value = false
  createError.value = null
  createFieldErrors.value = {}
  createOpen.value = true
}

useEscapeKey(
  () => createOpen.value,
  () => {
    createOpen.value = false
  },
)

async function submitCreate(): Promise<void> {
  createSubmitting.value = true
  createError.value = null
  createFieldErrors.value = {}

  const phoneValidation = validateBrazilPhoneField(createPhone.value)
  if (!phoneValidation.ok) {
    createFieldErrors.value = { phone: phoneValidation.error }
    createSubmitting.value = false
    return
  }

  try {
    await createContact({
      phone: phoneValidation.normalized,
      display_name: createName.value.trim() || null,
      marketing_opt_in: createOptIn.value,
    })
    createOpen.value = false
    await loadContacts()
  } catch (err) {
    const validation = getValidationErrors(err)
    if (validation) {
      createFieldErrors.value = validation
    } else {
      createError.value = getErrorMessage(err)
    }
  } finally {
    createSubmitting.value = false
  }
}

function openEdit(contact: Contact): void {
  editContactId.value = contact.id
  editName.value = contact.display_name ?? ''
  editPhone.value = formatBrazilPhone(contact.phone) || contact.phone
  editOptIn.value = contact.marketing_opt_in
  editError.value = null
  editFieldErrors.value = {}
  editOpen.value = true
}

useEscapeKey(
  () => editOpen.value,
  () => {
    editOpen.value = false
  },
)

async function submitEdit(): Promise<void> {
  if (editContactId.value == null) return
  editSubmitting.value = true
  editError.value = null
  editFieldErrors.value = {}

  const phoneValidation = validateBrazilPhoneField(editPhone.value)
  if (!phoneValidation.ok) {
    editFieldErrors.value = { phone: phoneValidation.error }
    editSubmitting.value = false
    return
  }

  try {
    await updateContact(editContactId.value, {
      phone: phoneValidation.normalized,
      display_name: editName.value.trim() || null,
      marketing_opt_in: editOptIn.value,
    })
    editOpen.value = false
    await loadContacts()
  } catch (err) {
    const validation = getValidationErrors(err)
    if (validation) {
      editFieldErrors.value = validation
    } else {
      editError.value = getErrorMessage(err)
    }
  } finally {
    editSubmitting.value = false
  }
}

function requestDelete(contact: Contact): void {
  contactPendingDelete.value = contact
  deleteConfirmOpen.value = true
}

async function confirmDeleteContact(): Promise<void> {
  if (!contactPendingDelete.value) return
  deleteSubmitting.value = true
  try {
    await deleteContact(contactPendingDelete.value.id)
    deleteConfirmOpen.value = false
    contactPendingDelete.value = null
    await loadContacts()
  } catch (err) {
    editError.value = getErrorMessage(err)
  } finally {
    deleteSubmitting.value = false
  }
}

function triggerImport(): void {
  importInput.value?.click()
}

async function onImportFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }
  importSubmitting.value = true
  importMessage.value = null
  try {
    const result = await importContactsCsv(file)
    importMessage.value = `Importação concluída: ${result.created} criados, ${result.updated} atualizados, ${result.skipped} ignorados.`
    await loadContacts()
  } catch (err) {
    const validation = getValidationErrors(err)
    importMessage.value = validation?.file ?? getErrorMessage(err)
  } finally {
    importSubmitting.value = false
  }
}
</script>

<template>
  <AppPageShell
    title="Contatos"
    subtitle="Organize clientes e importações em um só lugar."
    :breadcrumbs="panelBreadcrumbs({ label: 'Contatos' })"
  >
    <template #actions>
      <UiButton variant="secondary" :disabled="importSubmitting" @click="triggerImport">
        <Upload class="h-4 w-4 text-brand-gray" aria-hidden="true" />
        Importar CSV
      </UiButton>
      <input
        ref="importInput"
        type="file"
        accept=".csv,text/csv"
        class="hidden"
        aria-label="Importar contatos CSV"
        @change="onImportFile"
      />
      <UiButton @click="openCreate">
        <Plus class="h-4 w-4" aria-hidden="true" />
        Novo contato
      </UiButton>
    </template>

    <div class="flex min-h-0 flex-1 flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <p v-if="importMessage" class="text-sm text-brand-indigo" role="status">{{ importMessage }}</p>

      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" aria-label="Carregando contatos" />
      </div>

      <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p class="text-sm text-red-800">{{ error }}</p>
        <UiButton class="mt-3" @click="loadContacts">Tentar novamente</UiButton>
      </div>

      <template v-else>
        <UiCard padding="none" class="overflow-hidden">
          <div
            class="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
            :class="hasContacts ? 'border-b border-slate-100' : ''"
          >
            <UiInput
              v-model="search"
              type="search"
              placeholder="Buscar por nome ou telefone..."
              aria-label="Buscar por nome ou telefone"
              class="min-w-0 flex-1"
              input-class="w-full"
            >
              <template #leading>
                <Search class="h-4 w-4" aria-hidden="true" />
              </template>
            </UiInput>
            <p class="shrink-0 text-xs text-brand-gray sm:text-right">
              {{ listedCountLabel }}
            </p>
          </div>

          <UiTable v-if="hasContacts" class="rounded-none border-0">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Telefone</th>
                <th scope="col">Opt-in marketing</th>
                <th scope="col" class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="contact in contacts"
                :key="contact.id"
                class="cursor-pointer hover:bg-slate-50/80"
                @click="openEdit(contact)"
              >
                <td class="font-medium text-brand-ink">
                  {{ contact.display_name || '—' }}
                </td>
                <td class="text-brand-gray">
                  {{ formatBrazilPhone(contact.phone) || contact.phone }}
                </td>
                <td>
                  <UiBadge :variant="contact.marketing_opt_in ? 'success' : 'neutral'" size="md">
                    {{ contact.marketing_opt_in ? 'Sim' : 'Não' }}
                  </UiBadge>
                </td>
                <td class="text-right" @click.stop>
                  <div class="inline-flex items-center justify-end gap-1">
                    <UiButton
                      variant="ghost"
                      size="sm"
                      class="!px-2"
                      aria-label="Editar contato"
                      @click="openEdit(contact)"
                    >
                      <Pencil class="h-4 w-4" aria-hidden="true" />
                    </UiButton>
                    <UiButton
                      variant="ghost"
                      size="sm"
                      class="!px-2 text-brand-gray hover:text-red-600"
                      aria-label="Excluir contato"
                      @click="requestDelete(contact)"
                    >
                      <Trash2 class="h-4 w-4" aria-hidden="true" />
                    </UiButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </UiTable>
        </UiCard>

        <EmptyState
          v-if="!hasContacts"
          :icon="Users"
          title="Nenhum contato cadastrado"
          description="Importe uma planilha ou adicione contatos manualmente."
        >
          <template #actions>
            <UiButton variant="secondary" @click="triggerImport">
              <Upload class="h-4 w-4 text-brand-gray" aria-hidden="true" />
              Importar CSV
            </UiButton>
            <UiButton @click="openCreate">
              <Plus class="h-4 w-4" aria-hidden="true" />
              Novo contato
            </UiButton>
          </template>
        </EmptyState>
      </template>

      <AppPageFooter class="mt-auto" />
    </div>

    <Teleport to="body">
      <div
        v-if="createOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-contact-title"
        @click.self="createOpen = false"
      >
        <form
          class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
          @submit.prevent="submitCreate"
        >
          <h2 id="create-contact-title" class="text-lg font-bold text-brand-ink">Novo contato</h2>
          <p v-if="createError" class="mt-2 text-sm text-red-600" role="alert">{{ createError }}</p>
          <div class="mt-4 space-y-3">
            <div>
              <label class="text-xs font-semibold text-brand-ink" for="contact-phone">Telefone *</label>
              <UiInput
                id="contact-phone"
                v-model="createPhone"
                type="tel"
                class="mt-1"
                placeholder="5511999999999"
                :invalid="Boolean(createFieldErrors.phone)"
                autocomplete="tel"
              />
              <p v-if="createFieldErrors.phone" class="mt-1 text-xs text-red-600">
                {{ createFieldErrors.phone }}
              </p>
            </div>
            <div>
              <label class="text-xs font-semibold text-brand-ink" for="contact-name">Nome</label>
              <UiInput
                id="contact-name"
                v-model="createName"
                type="text"
                class="mt-1"
                :invalid="Boolean(createFieldErrors.display_name)"
                @input="delete createFieldErrors.phone"
              />
              <p v-if="createFieldErrors.display_name" class="mt-1 text-xs text-red-600">
                {{ createFieldErrors.display_name }}
              </p>
            </div>
            <label class="flex items-center gap-2 text-sm text-brand-ink">
              <input v-model="createOptIn" type="checkbox" class="rounded border-slate-300 text-brand-indigo" />
              Opt-in para campanhas de marketing
            </label>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <UiButton variant="secondary" type="button" @click="createOpen = false">Cancelar</UiButton>
            <UiButton type="submit" :disabled="createSubmitting">Salvar</UiButton>
          </div>
        </form>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="editOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-contact-title"
        @click.self="editOpen = false"
      >
        <form
          class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
          @submit.prevent="submitEdit"
        >
          <h2 id="edit-contact-title" class="text-lg font-bold text-brand-ink">Editar contato</h2>
          <p v-if="editError" class="mt-2 text-sm text-red-600" role="alert">{{ editError }}</p>
          <div class="mt-4 space-y-3">
            <div>
              <label class="text-xs font-semibold text-brand-ink" for="edit-contact-phone">Telefone *</label>
              <UiInput
                id="edit-contact-phone"
                v-model="editPhone"
                type="tel"
                class="mt-1"
                :invalid="Boolean(editFieldErrors.phone)"
                autocomplete="tel"
                @input="delete editFieldErrors.phone"
              />
              <p v-if="editFieldErrors.phone" class="mt-1 text-xs text-red-600">
                {{ editFieldErrors.phone }}
              </p>
            </div>
            <div>
              <label class="text-xs font-semibold text-brand-ink" for="edit-contact-name">Nome</label>
              <UiInput
                id="edit-contact-name"
                v-model="editName"
                type="text"
                class="mt-1"
                :invalid="Boolean(editFieldErrors.display_name)"
                @input="delete editFieldErrors.display_name"
              />
              <p v-if="editFieldErrors.display_name" class="mt-1 text-xs text-red-600">
                {{ editFieldErrors.display_name }}
              </p>
            </div>
            <label class="flex items-center gap-2 text-sm text-brand-ink">
              <input v-model="editOptIn" type="checkbox" class="rounded border-slate-300 text-brand-indigo" />
              Opt-in para campanhas de marketing
            </label>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <UiButton variant="secondary" type="button" @click="editOpen = false">Cancelar</UiButton>
            <UiButton type="submit" :disabled="editSubmitting">Salvar</UiButton>
          </div>
        </form>
      </div>
    </Teleport>

    <AppConfirmModal
      :open="deleteConfirmOpen"
      title="Excluir contato"
      :message="deleteConfirmMessage"
      confirm-label="Excluir"
      variant="danger"
      :loading="deleteSubmitting"
      @close="deleteConfirmOpen = false"
      @confirm="confirmDeleteContact"
    />
  </AppPageShell>
</template>

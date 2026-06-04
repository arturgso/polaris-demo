<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  BaseButton,
  BaseEmptyState,
  BaseModal,
  BaseSelect,
  BaseTextField,
  GiftCard,
} from '../components';
import { BEATRIZ_PERSON_ID } from '../constants';
import { showSuccessToast, usePageHeader } from '../composables';
import {
  deleteVaultGiftItem,
  getEvents,
  getGiftStatuses,
  getVaultGiftItems,
  getVaultGiftLists,
  updateVaultGiftItem,
} from '../services';
import type {
  Event,
  GiftStatus,
  GiftWithPersonId,
  VaultGiftFormData,
  VaultGiftItem,
  VaultGiftList,
} from '../types';

const route = useRoute();
const router = useRouter();
const { resetPageHeader, setPageHeader } = usePageHeader();
const vaultItems = ref<VaultGiftItem[]>([]);
const vaultGiftLists = ref<VaultGiftList[]>([]);
const events = ref<Event[]>([]);
const statuses = ref<GiftStatus[]>([]);
const searchTerm = ref<string>('');
const selectedEventIds = ref<number[]>([]);
const isSaving = ref<boolean>(false);
const isDeleting = ref<boolean>(false);
const modalErrorMessage = ref<string>('');
const itemToEdit = ref<VaultGiftItem | null>(null);
const itemToDelete = ref<VaultGiftItem | null>(null);
const isItemModalOpen = ref<boolean>(false);
let searchTimeoutId: ReturnType<typeof setTimeout> | undefined;

const itemForm = ref<VaultGiftFormData>({
  title: '',
  link: '',
  event: '',
  status: '',
  giftListId: 0,
});

const selectedListId = computed(() => getQueryId(route.query.listId));
const selectedList = computed(() => vaultGiftLists.value.find((list) => list.id === selectedListId.value));
const hasActiveFilters = computed(() => selectedEventIds.value.length > 0);
const visibleGifts = computed(() => vaultItems.value.map(toGiftWithPersonId));
const giftListOptions = computed(() => [
  {
    id: 0,
    name: 'Sem lista',
  },
  ...vaultGiftLists.value.map((list) => ({
    id: list.id,
    name: list.name,
  })),
]);

function getQueryId(value: unknown) {
  const queryValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = Number(queryValue);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : undefined;
}

function getQueryString(value: unknown) {
  const queryValue = Array.isArray(value) ? value[0] : value;

  return typeof queryValue === 'string' && queryValue ? queryValue : undefined;
}

function getSelectedTag(items: Array<{ id: number; tag: string }>, ids: number[], fallbackTag?: string) {
  const selectedId = ids.length === 1 ? ids[0] : undefined;

  return items.find((item) => item.id === selectedId)?.tag ?? fallbackTag;
}

function toGiftWithPersonId(item: VaultGiftItem): GiftWithPersonId {
  return {
    id: item.id,
    title: item.title,
    link: item.link,
    giftFor: 'Beatriz',
    event: item.event,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    personId: BEATRIZ_PERSON_ID,
  };
}

function getGiftFilters() {
  const title = searchTerm.value.trim();

  return {
    title: title || undefined,
    event: getSelectedTag(events.value, selectedEventIds.value, getQueryString(route.query.event)),
  };
}

function syncFiltersFromRoute() {
  const eventTag = getQueryString(route.query.event);
  const eventId = events.value.find((event) => event.tag === eventTag)?.id;

  selectedEventIds.value = eventId ? [eventId] : [];
}

function toggleEventFilter(id: number) {
  const selectedOption = events.value.find((event) => event.id === id);

  if (!selectedOption) {
    return;
  }

  const currentTag = getQueryString(route.query.event);

  void router.replace({
    path: '/vault',
    query: {
      ...route.query,
      event: currentTag === selectedOption.tag ? undefined : selectedOption.tag,
    },
  });
}

function clearFilters() {
  void router.replace({
    path: '/vault',
    query: {
      ...route.query,
      event: undefined,
    },
  });
}

async function loadOptions() {
  const [loadedEvents, loadedStatuses] = await Promise.all([
    getEvents(),
    getGiftStatuses(),
  ]);

  events.value = loadedEvents;
  statuses.value = loadedStatuses;
  syncFiltersFromRoute();
}

function loadVaultPage() {
  vaultGiftLists.value = getVaultGiftLists();
  vaultItems.value = getVaultGiftItems(getGiftFilters(), selectedListId.value);
}

function openEditItemModal(gift: GiftWithPersonId) {
  const item = vaultItems.value.find((candidate) => candidate.id === gift.id);

  if (!item) {
    return;
  }

  itemToEdit.value = item;
  itemForm.value = {
    title: item.title,
    link: item.link ?? '',
    event: item.event ?? events.value[0]?.tag ?? '',
    status: item.status ?? statuses.value[0]?.tag ?? '',
    giftListId: item.giftListId ?? 0,
  };
  modalErrorMessage.value = '';
  isItemModalOpen.value = true;
}

function closeItemModal() {
  isItemModalOpen.value = false;
  itemToEdit.value = null;
  modalErrorMessage.value = '';
}

function openDeleteItemModal(gift: GiftWithPersonId) {
  const item = vaultItems.value.find((candidate) => candidate.id === gift.id);

  if (!item) {
    return;
  }

  itemToDelete.value = item;
  modalErrorMessage.value = '';
}

function submitItem() {
  if (!itemForm.value.title.trim()) {
    modalErrorMessage.value = 'Informe o titulo.';
    return;
  }

  isSaving.value = true;
  modalErrorMessage.value = '';

  try {
    const payload = {
      title: itemForm.value.title,
      link: itemForm.value.link || undefined,
      event: itemForm.value.event || undefined,
      status: itemForm.value.status || undefined,
      giftListId: itemForm.value.giftListId || undefined,
    };

    if (!itemToEdit.value) {
      return;
    }

    updateVaultGiftItem(itemToEdit.value.id, payload);
    showSuccessToast('Presente atualizado.');
    closeItemModal();
    loadVaultPage();
  } finally {
    isSaving.value = false;
  }
}

function confirmDeleteItem() {
  if (!itemToDelete.value) {
    return;
  }

  isDeleting.value = true;

  try {
    deleteVaultGiftItem(itemToDelete.value.id);
    itemToDelete.value = null;
    loadVaultPage();
    showSuccessToast('Presente deletado.');
  } finally {
    isDeleting.value = false;
  }
}

onMounted(() => {
  void loadOptions().finally(loadVaultPage);
  window.addEventListener('polaris:vault-changed', loadVaultPage);
  window.addEventListener('polaris:events-changed', loadOptions);
});

onUnmounted(() => {
  if (searchTimeoutId) {
    clearTimeout(searchTimeoutId);
  }

  window.removeEventListener('polaris:vault-changed', loadVaultPage);
  window.removeEventListener('polaris:events-changed', loadOptions);
  resetPageHeader();
});

watch(() => route.query, () => {
  syncFiltersFromRoute();
  loadVaultPage();
}, { immediate: true });

watch(searchTerm, () => {
  if (searchTimeoutId) {
    clearTimeout(searchTimeoutId);
  }

  searchTimeoutId = setTimeout(loadVaultPage, 300);
});

watchEffect(() => {
  setPageHeader({
    title: selectedList.value ? `Cofre - ${selectedList.value.name}` : 'Cofre',
    searchTerm: searchTerm.value,
    searchPlaceholder: 'Pesquisar',
    filters: [
      {
        title: 'Eventos',
        items: events.value,
        selectedIds: selectedEventIds.value,
        onToggle: toggleEventFilter,
      },
    ],
    hasActiveFilters: hasActiveFilters.value,
    onSearchTermChange: (value) => {
      searchTerm.value = value;
    },
    onClearFilters: clearFilters,
  });
});
</script>

<template>
  <div class="flex h-full flex-col gap-6">
    <BaseEmptyState
      v-if="visibleGifts.length === 0"
      :message="hasActiveFilters || searchTerm.trim() ? 'Nenhum presente privado encontrado para os filtros atuais.' : 'Nenhum presente privado cadastrado.'"
    />

    <div
      v-else
      class="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),24rem))] items-start gap-5"
    >
      <div
        v-for="(gift, index) in visibleGifts"
        :key="gift.id"
        class="motion-card-enter"
        :style="{ '--motion-delay': `${index * 30}ms` }"
      >
        <GiftCard
          :gift="gift"
          :events="events"
          :statuses="statuses"
          @edit="openEditItemModal"
          @delete="openDeleteItemModal"
        />
      </div>
    </div>
  </div>

  <BaseModal
    :is-open="isItemModalOpen"
    title="Editar presente privado"
    @close="closeItemModal"
  >
    <form
      class="flex flex-col gap-4"
      @submit.prevent="submitItem"
    >
      <BaseTextField
        v-model="itemForm.title"
        label="Titulo"
        required
      />
      <BaseTextField
        v-model="itemForm.link"
        label="Link"
        type="url"
      />
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <BaseSelect
          :model-value="events.find((event) => event.tag === itemForm.event)?.id ?? 0"
          label="Evento"
          :options="events.map((event) => ({ id: event.id, name: event.name }))"
          @update:model-value="itemForm.event = events.find((event) => event.id === $event)?.tag ?? ''"
        />
        <BaseSelect
          :model-value="statuses.find((status) => status.tag === itemForm.status)?.id ?? 0"
          label="Status"
          :options="statuses.map((status) => ({ id: status.id, name: status.name }))"
          @update:model-value="itemForm.status = statuses.find((status) => status.id === $event)?.tag ?? ''"
        />
      </div>
      <BaseSelect
        v-model="itemForm.giftListId"
        label="Lista de presentes"
        :options="giftListOptions"
      />
      <p
        v-if="modalErrorMessage"
        class="text-sm text-text-secondary"
      >
        {{ modalErrorMessage }}
      </p>
      <div class="flex flex-wrap justify-end gap-2">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSaving"
          @click="closeItemModal"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          type="submit"
          variant="primary"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Salvando...' : 'Salvar' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>

  <BaseModal
    :is-open="itemToDelete !== null"
    title="Deletar presente privado"
    @close="itemToDelete = null"
  >
    <div class="flex flex-col gap-2">
      <p class="text-sm text-text-secondary">
        Tem certeza que deseja deletar este presente?
      </p>
      <p class="font-semibold text-text-primary">
        {{ itemToDelete?.title }}
      </p>
    </div>

    <template #footer>
      <BaseButton
        variant="secondary"
        :disabled="isDeleting"
        @click="itemToDelete = null"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        variant="primary"
        :disabled="isDeleting"
        @click="confirmDeleteItem"
      >
        <template #icon>
          <Trash2 :size="16" />
        </template>
        {{ isDeleting ? 'Deletando...' : 'Deletar' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

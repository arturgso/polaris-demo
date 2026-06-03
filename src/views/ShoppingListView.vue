<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import {
  BaseButton,
  BaseEmptyState,
  BaseModal,
  ShoppingItemCard,
  ShoppingItemForm,
} from '@/components';
import { showErrorToast, showSuccessToast, usePageHeader } from '@/composables';
import {
  deleteShoppingItem,
  getShoppingItemCategories,
  getShoppingItems,
  getShoppingItemStatuses,
  updateShoppingItem,
} from '@/services';
import type {
  ShoppingItem,
  ShoppingItemCategory,
  ShoppingItemFormData,
  ShoppingItemStatus,
} from '@/types';

const shoppingItems = ref<ShoppingItem[]>([]);
const categories = ref<ShoppingItemCategory[]>([]);
const statuses = ref<ShoppingItemStatus[]>([]);
const route = useRoute();
const isLoading = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const errorMessage = ref<string>('');
const modalErrorMessage = ref<string>('');
const itemToEdit = ref<ShoppingItem | null>(null);
const itemToDelete = ref<ShoppingItem | null>(null);
const isDeleting = ref<boolean>(false);
const searchTerm = ref<string>('');
const selectedCategoryIds = ref<number[]>([]);
const selectedStatusIds = ref<number[]>([]);
const { resetPageHeader, setPageHeader } = usePageHeader();
let shoppingItemsRequestId = 0;
let searchTimeoutId: ReturnType<typeof setTimeout> | undefined;
const emptyForm: ShoppingItemFormData = {
  title: '',
  link: '',
  price: 0,
  categoryId: 0,
  statusId: 0,
};
const itemForm = ref<ShoppingItemFormData>({ ...emptyForm });

const filteredShoppingItems = computed(() => {
  return shoppingItems.value.filter((item) => {
    const matchesCategory = selectedCategoryIds.value.length === 0
      || selectedCategoryIds.value.includes(item.category.id);
    const matchesStatus = selectedStatusIds.value.length === 0
      || selectedStatusIds.value.includes(item.status.id);

    return matchesCategory && matchesStatus;
  });
});

const hasActiveFilters = computed(() => selectedCategoryIds.value.length > 0 || selectedStatusIds.value.length > 0);

function getSelectedCategoryId() {
  const categoryId = route.query.categoryId;
  const normalizedCategoryId = Array.isArray(categoryId) ? categoryId[0] : categoryId;
  const parsedCategoryId = Number(normalizedCategoryId);

  return Number.isFinite(parsedCategoryId) && parsedCategoryId > 0 ? parsedCategoryId : undefined;
}

async function loadShoppingItems() {
  const currentRequestId = shoppingItemsRequestId + 1;
  const title = searchTerm.value.trim();

  shoppingItemsRequestId = currentRequestId;
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const loadedShoppingItems = await getShoppingItems(title ? { title } : {});

    if (currentRequestId === shoppingItemsRequestId) {
      shoppingItems.value = loadedShoppingItems;
    }
  } catch {
    if (currentRequestId === shoppingItemsRequestId) {
      errorMessage.value = 'Nao foi possivel carregar a lista de compras.';
    }
  } finally {
    if (currentRequestId === shoppingItemsRequestId) {
      isLoading.value = false;
    }
  }
}

async function loadShoppingItemOptions() {
  const [loadedCategories, loadedStatuses] = await Promise.all([
    getShoppingItemCategories(),
    getShoppingItemStatuses(),
  ]);

  categories.value = loadedCategories;
  statuses.value = loadedStatuses;
}

function toggleFilter(filterValues: number[], value: number) {
  const currentIndex = filterValues.indexOf(value);

  if (currentIndex >= 0) {
    filterValues.splice(currentIndex, 1);
    return;
  }

  filterValues.push(value);
}

function openEditModal(item: ShoppingItem) {
  itemForm.value = {
    title: item.title,
    link: item.link,
    price: item.price,
    categoryId: item.category.id,
    statusId: item.status.id,
  };
  modalErrorMessage.value = '';
  itemToEdit.value = item;
}

function openDeleteModal(item: ShoppingItem) {
  modalErrorMessage.value = '';
  itemToDelete.value = item;
}

function clearFilters() {
  selectedCategoryIds.value = [];
  selectedStatusIds.value = [];
}

async function submitEditedItem() {
  if (!itemToEdit.value) {
    return;
  }

  isSaving.value = true;
  modalErrorMessage.value = '';

  try {
    await updateShoppingItem(itemToEdit.value.id, itemForm.value);
    itemToEdit.value = null;
    await loadShoppingItems();
    showSuccessToast('Item atualizado.');
  } catch {
    modalErrorMessage.value = 'Nao foi possivel atualizar o item.';
    showErrorToast('Nao foi possivel atualizar o item.');
  } finally {
    isSaving.value = false;
  }
}

async function confirmDeleteItem() {
  if (!itemToDelete.value) {
    return;
  }

  isDeleting.value = true;

  try {
    await deleteShoppingItem(itemToDelete.value.id);
    itemToDelete.value = null;
    await loadShoppingItems();
    showSuccessToast('Item deletado.');
  } catch {
    modalErrorMessage.value = 'Nao foi possivel deletar o item.';
    showErrorToast('Nao foi possivel deletar o item.');
  } finally {
    isDeleting.value = false;
  }
}

function handleShoppingItemsChanged() {
  void loadShoppingItems();
}

onMounted(() => {
  const categoryId = getSelectedCategoryId();

  if (categoryId) {
    selectedCategoryIds.value = [categoryId];
  }

  void loadShoppingItems();
  void loadShoppingItemOptions();
  window.addEventListener('polaris:shopping-items-changed', handleShoppingItemsChanged);
});

onUnmounted(() => {
  if (searchTimeoutId) {
    clearTimeout(searchTimeoutId);
  }

  window.removeEventListener('polaris:shopping-items-changed', handleShoppingItemsChanged);
  resetPageHeader();
});

watch(
  () => route.query.categoryId,
  () => {
    const categoryId = getSelectedCategoryId();
    selectedCategoryIds.value = categoryId ? [categoryId] : [];
  },
);

watch(searchTerm, () => {
  if (searchTimeoutId) {
    clearTimeout(searchTimeoutId);
  }

  searchTimeoutId = setTimeout(() => {
    void loadShoppingItems();
  }, 300);
});

watchEffect(() => {
  setPageHeader({
    title: 'Lista de compras',
    searchTerm: searchTerm.value,
    searchPlaceholder: 'Pesquisar',
    filters: [
      {
        title: 'Categorias',
        items: categories.value,
        selectedIds: selectedCategoryIds.value,
        onToggle: (id) => toggleFilter(selectedCategoryIds.value, id),
      },
      {
        title: 'Status',
        items: statuses.value,
        selectedIds: selectedStatusIds.value,
        onToggle: (id) => toggleFilter(selectedStatusIds.value, id),
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
  <div class="flex h-full flex-col items-center">
    <div class="flex w-full flex-col gap-8">
      <BaseEmptyState
        v-if="isLoading"
        message="Carregando lista de compras..."
      />

      <div
        v-else-if="errorMessage"
        class="flex w-full items-center justify-between gap-4 rounded-md border-2 border-border bg-card p-6"
      >
        <p class="text-sm text-text-secondary">
          {{ errorMessage }}
        </p>
        <BaseButton
          variant="primary"
          @click="loadShoppingItems"
        >
          Tentar novamente
        </BaseButton>
      </div>

      <BaseEmptyState
        v-else-if="shoppingItems.length === 0"
        message="Nenhum item encontrado na lista de compras."
      />

      <BaseEmptyState
        v-else-if="filteredShoppingItems.length === 0"
        message="Nenhum item encontrado para os filtros atuais."
      />

      <div
        v-else
        class="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),24rem))] justify-center gap-5"
      >
        <div
          v-for="(item, index) in filteredShoppingItems"
          :key="item.id"
          class="motion-card-enter w-full max-w-sm"
          :style="{ '--motion-delay': `${index * 30}ms` }"
        >
          <ShoppingItemCard
            :item="item"
            @edit="openEditModal"
            @delete="openDeleteModal"
          />
        </div>
      </div>
    </div>
  </div>

  <BaseModal
    :is-open="itemToEdit !== null"
    title="Editar item"
    @close="itemToEdit = null"
  >
    <ShoppingItemForm
      v-model="itemForm"
      :categories="categories"
      :statuses="statuses"
      :is-saving="isSaving"
      :error-message="modalErrorMessage"
      @submit="submitEditedItem"
      @cancel="itemToEdit = null"
    />
  </BaseModal>

  <BaseModal
    :is-open="itemToDelete !== null"
    title="Deletar item"
    @close="itemToDelete = null"
  >
    <div class="flex flex-col gap-2">
      <p class="text-sm text-text-secondary">
        Tem certeza que deseja deletar este item?
      </p>
      <p class="font-semibold text-text-primary">
        {{ itemToDelete?.title }}
      </p>
      <p
        v-if="modalErrorMessage"
        class="text-sm text-text-secondary"
      >
        {{ modalErrorMessage }}
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

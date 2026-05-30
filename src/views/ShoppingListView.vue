<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ShoppingItemCard from '../components/shoppingList/ShoppingItemCard.vue';
import ShoppingItemForm from '../components/shoppingList/ShoppingItemForm.vue';
import ShoppingListToolbar from '../components/shoppingList/ShoppingListToolbar.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseEmptyState from '../components/ui/BaseEmptyState.vue';
import BaseModal from '../components/ui/BaseModal.vue';
import { DEFAULT_SHOPPING_ITEM_COLOR } from '../constants/shoppingItemColors';
import {
  createShoppingItem,
  deleteShoppingItem,
  getShoppingItemCategories,
  getShoppingItems,
  getShoppingItemStatuses,
  updateShoppingItem,
} from '../services/shoppingItems';
import type { ShoppingItem, ShoppingItemCategory, ShoppingItemStatus } from '../types/ShoppingList';
import type { ShoppingItemFormData } from '../types/ShoppingItemForm';

const shoppingItems = ref<ShoppingItem[]>([]);
const categories = ref<ShoppingItemCategory[]>([]);
const statuses = ref<ShoppingItemStatus[]>([]);
const route = useRoute();
const isLoading = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const errorMessage = ref<string>('');
const modalErrorMessage = ref<string>('');
const isAddModalOpen = ref<boolean>(false);
const itemToEdit = ref<ShoppingItem | null>(null);
const itemToDelete = ref<ShoppingItem | null>(null);
const isDeleting = ref<boolean>(false);
const searchTerm = ref<string>('');
const selectedCategoryIds = ref<number[]>([]);
const selectedStatusIds = ref<number[]>([]);
const emptyForm: ShoppingItemFormData = {
  title: '',
  link: '',
  price: 0,
  color: DEFAULT_SHOPPING_ITEM_COLOR,
  categoryId: 0,
  statusId: 0,
};
const itemForm = ref<ShoppingItemFormData>({ ...emptyForm });

const filteredShoppingItems = computed(() => {
  const normalizedSearch = searchTerm.value.trim().toLowerCase();

  return shoppingItems.value.filter((item) => {
    const matchesSearch = normalizedSearch.length === 0
      || item.title.toLowerCase().includes(normalizedSearch)
      || item.link.toLowerCase().includes(normalizedSearch)
      || item.category.name.toLowerCase().includes(normalizedSearch)
      || item.status.name.toLowerCase().includes(normalizedSearch);
    const matchesCategory = selectedCategoryIds.value.length === 0
      || selectedCategoryIds.value.includes(item.category.id);
    const matchesStatus = selectedStatusIds.value.length === 0
      || selectedStatusIds.value.includes(item.status.id);

    return matchesSearch && matchesCategory && matchesStatus;
  });
});

function getSelectedCategoryId() {
  const categoryId = route.query.categoryId;
  const normalizedCategoryId = Array.isArray(categoryId) ? categoryId[0] : categoryId;
  const parsedCategoryId = Number(normalizedCategoryId);

  return Number.isFinite(parsedCategoryId) && parsedCategoryId > 0 ? parsedCategoryId : undefined;
}

async function loadShoppingItems() {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    shoppingItems.value = await getShoppingItems();
  } catch {
    errorMessage.value = 'Nao foi possivel carregar a lista de compras.';
  } finally {
    isLoading.value = false;
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

function resetForm() {
  itemForm.value = {
    ...emptyForm,
    categoryId: categories.value[0]?.id ?? 0,
    statusId: statuses.value[0]?.id ?? 0,
  };
  modalErrorMessage.value = '';
}

function openAddModal() {
  resetForm();
  isAddModalOpen.value = true;
}

function openEditModal(item: ShoppingItem) {
  itemForm.value = {
    title: item.title,
    link: item.link,
    price: item.price,
    color: item.color ?? DEFAULT_SHOPPING_ITEM_COLOR,
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

async function submitNewItem() {
  isSaving.value = true;
  modalErrorMessage.value = '';

  try {
    await createShoppingItem(itemForm.value);
    isAddModalOpen.value = false;
    await loadShoppingItems();
  } catch {
    modalErrorMessage.value = 'Nao foi possivel salvar o item.';
  } finally {
    isSaving.value = false;
  }
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
  } catch {
    modalErrorMessage.value = 'Nao foi possivel atualizar o item.';
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
  } catch {
    modalErrorMessage.value = 'Nao foi possivel deletar o item.';
  } finally {
    isDeleting.value = false;
  }
}

onMounted(() => {
  const categoryId = getSelectedCategoryId();

  if (categoryId) {
    selectedCategoryIds.value = [categoryId];
  }

  void loadShoppingItems();
  void loadShoppingItemOptions();
});

watch(
  () => route.query.categoryId,
  () => {
    const categoryId = getSelectedCategoryId();
    selectedCategoryIds.value = categoryId ? [categoryId] : [];
  },
);
</script>

<template>
  <div class="mt-8 flex h-full flex-col items-center">
    <div class="flex w-full flex-col gap-6">
      <ShoppingListToolbar
        v-model:search-term="searchTerm"
        :categories="categories"
        :statuses="statuses"
        :selected-category-ids="selectedCategoryIds"
        :selected-status-ids="selectedStatusIds"
        @toggle-category="toggleFilter(selectedCategoryIds, $event)"
        @toggle-status="toggleFilter(selectedStatusIds, $event)"
        @clear-filters="clearFilters"
        @add="openAddModal"
      />

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
        class="grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="item in filteredShoppingItems"
          :key="item.id"
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
    :is-open="isAddModalOpen"
    title="Novo item"
    @close="isAddModalOpen = false"
  >
    <ShoppingItemForm
      v-model="itemForm"
      :categories="categories"
      :statuses="statuses"
      :is-saving="isSaving"
      :error-message="modalErrorMessage"
      @submit="submitNewItem"
      @cancel="isAddModalOpen = false"
    />
  </BaseModal>

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

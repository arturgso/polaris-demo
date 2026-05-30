<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import ShoppingItemCard from '../components/shoppingList/ShoppingItemCard.vue';
import BaseModal from '../components/ui/BaseModal.vue';
import {
  createShoppingItem,
  deleteShoppingItem,
  getShoppingItemCategories,
  getShoppingItems,
  getShoppingItemStatuses,
  updateShoppingItem,
} from '../services/shoppingItems';
import type { ShoppingItem, ShoppingItemCategory, ShoppingItemStatus } from '../types/ShoppingList';

interface ShoppingItemForm {
  title: string;
  link: string;
  price: number;
  categoryId: number;
  statusId: number;
}

const shoppingItems = ref<ShoppingItem[]>([]);
const categories = ref<ShoppingItemCategory[]>([]);
const statuses = ref<ShoppingItemStatus[]>([]);
const isLoading = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const errorMessage = ref<string>('');
const modalErrorMessage = ref<string>('');
const isAddModalOpen = ref<boolean>(false);
const itemToEdit = ref<ShoppingItem | null>(null);
const itemToDelete = ref<ShoppingItem | null>(null);
const isDeleting = ref<boolean>(false);
const emptyForm: ShoppingItemForm = {
  title: '',
  link: '',
  price: 0,
  categoryId: 0,
  statusId: 0,
};
const itemForm = ref<ShoppingItemForm>({ ...emptyForm });

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
  void loadShoppingItems();
  void loadShoppingItemOptions();
});
</script>

<template>
  <div class="mt-8 flex h-full flex-col items-center">
    <div class="flex w-full flex-col gap-6">
      <div class="flex items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-text-secondary">
          Lista de compras
        </h1>

        <button
          type="button"
          class="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition duration-150 hover:bg-accent-hover"
          @click="openAddModal"
        >
          <Plus :size="18" />
          Novo item
        </button>
      </div>

      <div
        v-if="isLoading"
        class="w-full rounded-md border-2 border-border bg-card p-6 text-sm text-text-secondary"
      >
        Carregando lista de compras...
      </div>

      <div
        v-else-if="errorMessage"
        class="flex w-full items-center justify-between gap-4 rounded-md border-2 border-border bg-card p-6"
      >
        <p class="text-sm text-text-secondary">
          {{ errorMessage }}
        </p>
        <button
          type="button"
          class="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition duration-150 hover:bg-accent-hover"
          @click="loadShoppingItems"
        >
          Tentar novamente
        </button>
      </div>

      <div
        v-else-if="shoppingItems.length === 0"
        class="w-full rounded-md border-2 border-border bg-card p-6 text-sm text-text-secondary"
      >
        Nenhum item encontrado na lista de compras.
      </div>

      <div
        v-else
        class="grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="item in shoppingItems"
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
    <form
      class="flex flex-col gap-4"
      @submit.prevent="submitNewItem"
    >
      <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
        Titulo
        <input
          v-model="itemForm.title"
          type="text"
          required
          class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
        >
      </label>
      <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
        Link
        <input
          v-model="itemForm.link"
          type="url"
          required
          class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
        >
      </label>
      <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
        Valor
        <input
          v-model.number="itemForm.price"
          type="number"
          min="0"
          step="0.01"
          required
          class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
        >
      </label>
      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
          Categoria
          <select
            v-model.number="itemForm.categoryId"
            required
            class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
          >
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </label>
        <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
          Status
          <select
            v-model.number="itemForm.statusId"
            required
            class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
          >
            <option
              v-for="status in statuses"
              :key="status.id"
              :value="status.id"
            >
              {{ status.name }}
            </option>
          </select>
        </label>
      </div>
      <p
        v-if="modalErrorMessage"
        class="text-sm text-text-secondary"
      >
        {{ modalErrorMessage }}
      </p>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="rounded-md border-2 border-border px-4 py-2 text-sm font-semibold text-text-secondary transition duration-150 hover:border-accent hover:text-text-primary"
          :disabled="isSaving"
          @click="isAddModalOpen = false"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </BaseModal>

  <BaseModal
    :is-open="itemToEdit !== null"
    title="Editar item"
    @close="itemToEdit = null"
  >
    <form
      class="flex flex-col gap-4"
      @submit.prevent="submitEditedItem"
    >
      <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
        Titulo
        <input
          v-model="itemForm.title"
          type="text"
          required
          class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
        >
      </label>
      <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
        Link
        <input
          v-model="itemForm.link"
          type="url"
          required
          class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
        >
      </label>
      <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
        Valor
        <input
          v-model.number="itemForm.price"
          type="number"
          min="0"
          step="0.01"
          required
          class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
        >
      </label>
      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
          Categoria
          <select
            v-model.number="itemForm.categoryId"
            required
            class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
          >
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </label>
        <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
          Status
          <select
            v-model.number="itemForm.statusId"
            required
            class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
          >
            <option
              v-for="status in statuses"
              :key="status.id"
              :value="status.id"
            >
              {{ status.name }}
            </option>
          </select>
        </label>
      </div>
      <p
        v-if="modalErrorMessage"
        class="text-sm text-text-secondary"
      >
        {{ modalErrorMessage }}
      </p>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="rounded-md border-2 border-border px-4 py-2 text-sm font-semibold text-text-secondary transition duration-150 hover:border-accent hover:text-text-primary"
          :disabled="isSaving"
          @click="itemToEdit = null"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
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
      <button
        type="button"
        class="rounded-md border-2 border-border px-4 py-2 text-sm font-semibold text-text-secondary transition duration-150 hover:border-accent hover:text-text-primary"
        :disabled="isDeleting"
        @click="itemToDelete = null"
      >
        Cancelar
      </button>
      <button
        type="button"
        class="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isDeleting"
        @click="confirmDeleteItem"
      >
        <Trash2 :size="16" />
        {{ isDeleting ? 'Deletando...' : 'Deletar' }}
      </button>
    </template>
  </BaseModal>
</template>

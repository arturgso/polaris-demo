<script setup lang="ts">
import { onMounted, ref } from 'vue';
import ShoppingItemCard from '../components/shoppingList/ShoppingItemCard.vue';
import { getShoppingItems } from '../services/shoppingItems';
import type { ShoppingItem } from '../types/ShoppingList';

const shoppingItems = ref<ShoppingItem[]>([]);
const isLoading = ref<boolean>(false);
const errorMessage = ref<string>('');

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

onMounted(() => {
  void loadShoppingItems();
});
</script>

<template>
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
      <ShoppingItemCard :item="item" />
    </div>
  </div>
</template>

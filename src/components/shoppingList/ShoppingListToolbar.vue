<script setup lang="ts">
import { Plus, Search, X } from 'lucide-vue-next';
import { computed } from 'vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseTextField from '../ui/BaseTextField.vue';
import ShoppingFilterDropdown from './ShoppingFilterDropdown.vue';
import type { ShoppingItemCategory, ShoppingItemStatus } from '../../types/ShoppingList';

const props = defineProps<{
  searchTerm: string;
  categories: ShoppingItemCategory[];
  statuses: ShoppingItemStatus[];
  selectedCategoryIds: number[];
  selectedStatusIds: number[];
}>();

const emit = defineEmits<{
  'update:searchTerm': [value: string];
  toggleCategory: [id: number];
  toggleStatus: [id: number];
  clearFilters: [];
  add: [];
}>();

const activeFilterCount = computed(() => props.selectedCategoryIds.length + props.selectedStatusIds.length);
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <h1 class="text-2xl font-bold text-text-secondary">
      Lista de compras
    </h1>

    <div class="flex flex-wrap items-center justify-end gap-2">
      <BaseTextField
        :model-value="searchTerm"
        type="search"
        placeholder="Pesquisar"
        :icon="Search"
        class="w-64"
        @update:model-value="emit('update:searchTerm', String($event))"
      />

      <ShoppingFilterDropdown
        title="Categorias"
        :items="categories"
        :selected-ids="selectedCategoryIds"
        @toggle="emit('toggleCategory', $event)"
      />

      <ShoppingFilterDropdown
        title="Status"
        :items="statuses"
        :selected-ids="selectedStatusIds"
        @toggle="emit('toggleStatus', $event)"
      />

      <BaseButton
        v-if="activeFilterCount > 0"
        variant="secondary"
        @click="emit('clearFilters')"
      >
        <template #icon>
          <X :size="16" />
        </template>
        Limpar
      </BaseButton>

      <BaseButton
        variant="primary"
        @click="emit('add')"
      >
        <template #icon>
          <Plus :size="18" />
        </template>
        Novo item
      </BaseButton>
    </div>
  </div>
</template>

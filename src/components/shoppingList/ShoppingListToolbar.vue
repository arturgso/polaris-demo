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
  <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <h1 class="text-2xl font-bold text-text-secondary">
      Lista de compras
    </h1>

    <div class="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
      <BaseTextField
        :model-value="searchTerm"
        type="search"
        placeholder="Pesquisar"
        :icon="Search"
        class="w-full sm:w-64"
        @update:model-value="emit('update:searchTerm', String($event))"
      />

      <div class="flex flex-wrap items-center gap-2">
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
  </div>
</template>

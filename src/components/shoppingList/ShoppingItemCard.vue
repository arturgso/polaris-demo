<script setup lang="ts">
import { EllipsisVertical} from 'lucide-vue-next';
import { CATEGORY, STATUS_LABELS, type ShoppingItem} from'../../types/ShoppingList';
defineProps<{
    item: ShoppingItem;
}>();

</script>

<template>
  <div class="bg-card p-4 rounded-md border-2 border-border relative flex flex-col gap-6 hover:border-accent transition duration-150">
    <button
      type="button"
      class="absolute right-2 top-3"
    >
      <EllipsisVertical :size="18" />            
    </button>

    <div class="flex flex-col gap-1">
      <a
        :href="item.link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <h1>{{ item.title }}</h1>
      </a>
      <div class="text-[11px] p-1 px-2 bg-surface rounded-sm capitalize font-semibold w-fit">
        {{ CATEGORY[item.category] }}
      </div>
    </div>
    <div class="flex items-center justify-between">
      <div class="text-[10px] p-1 bg-blue-500 rounded-sm uppercase font-semibold">
        {{ STATUS_LABELS[item.status] }}
      </div>
      <span class="text-accent font-bold">{{ item.price }}</span>
    </div>
  </div>
</template>
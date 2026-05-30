<script setup lang="ts">
import { Check, Filter } from 'lucide-vue-next';
import { ref } from 'vue';
import { useClickOutside } from '../../composables/useClickOutside';

defineProps<{
  title: string;
  items: Array<{
    id: number;
    name: string;
    color?: string;
  }>;
  selectedIds: number[];
}>();

const emit = defineEmits<{
  toggle: [id: number];
}>();

const isOpen = ref<boolean>(false);
const dropdownRef = ref<HTMLElement | null>(null);

useClickOutside(dropdownRef, () => {
  isOpen.value = false;
});
</script>

<template>
  <div
    ref="dropdownRef"
    class="relative"
  >
    <button
      type="button"
      class="flex h-10 items-center gap-2 rounded-md border-2 border-border bg-card px-3 text-sm font-semibold text-text-secondary transition duration-150 hover:border-accent hover:text-text-primary"
      :class="selectedIds.length > 0 ? 'border-accent text-text-primary' : ''"
      @click="isOpen = !isOpen"
    >
      <Filter :size="16" />
      {{ title }}
      <span
        v-if="selectedIds.length > 0"
        class="rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-bold text-bg"
      >
        {{ selectedIds.length }}
      </span>
    </button>

    <div
      v-if="isOpen"
      class="absolute left-0 top-12 z-20 flex w-48 max-w-[calc(100vw-2rem)] flex-col gap-1 rounded-md border-2 border-border bg-surface p-2 shadow-xl sm:left-auto sm:right-0"
    >
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="flex items-center justify-between gap-2 rounded-sm px-2 py-2 text-left text-sm text-text-secondary transition duration-150 hover:bg-card hover:text-text-primary"
        :class="selectedIds.includes(item.id) ? 'bg-card text-text-primary' : ''"
        @click="emit('toggle', item.id)"
      >
        <span class="flex min-w-0 items-center gap-2">
          <span
            v-if="item.color"
            class="h-3 w-3 shrink-0 rounded-sm"
            :style="{ backgroundColor: item.color }"
          />
          <span class="truncate">{{ item.name }}</span>
        </span>
        <Check
          v-if="selectedIds.includes(item.id)"
          :size="14"
          class="shrink-0"
        />
      </button>
    </div>
  </div>
</template>

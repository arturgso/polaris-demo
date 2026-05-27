<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next';
import { ref } from 'vue';

defineProps<{
    enableTitle: boolean;
    title?: string;
    isSidebarCollapsed: boolean;
}>();

const isCollapsed = ref(true);

const collapseSection = () => {
    isCollapsed.value = !isCollapsed.value;
};

</script>

<template>
  <div
    :class="[
      'flex flex-col',
      isSidebarCollapsed ? 'items-center gap-4' : 'p-3 gap-2'
    ]"
  >
    <div
      v-if="enableTitle"
      :class="[
        'flex justify-between gap-2 uppercase font-bold text-sm text-text-muted items-center',
        isSidebarCollapsed ? 'hidden' : '' 
      ]"
    >
      <span>{{ title }}</span>
      <button
        class="button"
        @click="collapseSection"
      >
        <ChevronDown
          :size="18" 
          class="transtition-transform duration-300"
          :class="{ 'rotate-180': isCollapsed }"
        />
      </button>
    </div>
    <slot v-if="isCollapsed" />
  </div>
</template>

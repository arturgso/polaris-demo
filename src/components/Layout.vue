<script setup lang="ts">
import { Menu } from 'lucide-vue-next';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './ui/sidebar/Sidebar.vue';

const isSidebarCollapsed = ref<boolean>(false);
const isDrawerOpen = ref<boolean>(false);
const isCompactScreen = ref<boolean>(false);
const route = useRoute();

function handleSidebarCollapse(value: boolean) {
  isSidebarCollapsed.value = value;
}

function updateScreenMode() {
  isCompactScreen.value = window.innerWidth < 1024;

  if (!isCompactScreen.value) {
    isDrawerOpen.value = false;
  }
}

onMounted(() => {
  updateScreenMode();
  window.addEventListener('resize', updateScreenMode);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenMode);
});

watch(
  () => route.fullPath,
  () => {
    isDrawerOpen.value = false;
  },
);
</script>

<template>
  <main class="min-h-dvh bg-bg">
    <button
      type="button"
      class="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-md border-2 border-border bg-surface text-text-secondary shadow-xl transition duration-150 hover:border-accent hover:text-text-primary lg:hidden"
      aria-label="Abrir menu"
      :aria-expanded="isDrawerOpen"
      @click="isDrawerOpen = true"
    >
      <Menu :size="20" />
    </button>

    <button
      v-if="isDrawerOpen"
      type="button"
      class="fixed inset-0 z-40 bg-bg/80 lg:hidden"
      aria-label="Fechar menu"
      @click="isDrawerOpen = false"
    />

    <Sidebar
      :is-drawer="isCompactScreen"
      :is-drawer-open="isDrawerOpen"
      @collapse="handleSidebarCollapse"
      @close="isDrawerOpen = false"
    />
    <div
      class="min-h-dvh px-4 pb-8 pt-20 transition-all sm:px-6 lg:px-10 lg:py-8 xl:px-12"
      :class="isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'"
    >
      <div class="mx-auto w-full max-w-7xl">
        <slot />
      </div>
    </div>
  </main>
</template>

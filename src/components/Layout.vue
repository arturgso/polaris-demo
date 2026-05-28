<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from './ui/sidebar/Sidebar.vue';

const isSidebarCollapsed = ref<boolean>(false);

  function handleSidebarCollapse(value: boolean) {
    isSidebarCollapsed.value = value; 
  }

</script>

<template>
  <main>
    <Sidebar @collapse="handleSidebarCollapse" />
    <div 
      class="p-4 transition-all h-dvh w-dvh"
      :class="isSidebarCollapsed ? 'ml-16' : 'ml-72'" 
    >
      <slot />
    </div>
  </main>
</template>
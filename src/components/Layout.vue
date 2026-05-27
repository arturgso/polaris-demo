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
      class="container mx-auto p-4 transition-all h-dvh"
      :class="isSidebarCollapsed ? 'ml-16' : 'ml-72'" 
    >
      <slot />
    </div>
  </main>
</template>
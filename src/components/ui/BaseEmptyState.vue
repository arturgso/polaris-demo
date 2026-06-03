<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>

<template>
  <div class="motion-enter w-full rounded-md border-2 border-border bg-card p-6 text-sm text-text-secondary">
    {{ message }}
  </div>
</template>

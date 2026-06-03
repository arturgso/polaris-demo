<script setup lang="ts">
import type { DashboardCardProps } from '@/types';

defineProps<{
    item: DashboardCardProps;
}>();

</script>

<template>
  <div class="interactive-lift h-full w-full rounded-md border-2 border-border bg-card p-6 hover:border-accent">
    <div class="flex flex-row items-center justify-between">
      <h1 class="text-sm text-text-secondary uppercase">
        {{ item.title }}
      </h1>
      <div class="p-2 bg-accent/15 text-accent rounded-md">
        <item.icon />
      </div>
    </div>
    <div class="mt-6">
      <h1 class="text-3xl font-bold">
        {{ item.info }}
      </h1>
      <p class="mt-2 text-sm capitalize text-text-secondary">
        {{ item.bottomInfo }}
      </p>
    </div>
  </div>
</template>

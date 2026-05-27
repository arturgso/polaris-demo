<script setup lang="ts">
import { type LucideProps } from 'lucide-vue-next';
import type { FunctionalComponent } from 'vue';

defineProps<{
    icon: FunctionalComponent<LucideProps>;
    title: string;
    info: string;
    bottomInfo: string;
}>();

</script>

<template>
  <div class="bg-card p-6 rounded-md border-2 border-border min-w-[22rem]">
    <div class="flex flex-row items-center justify-between">
      <h1 class="text-sm text-text-secondary uppercase">
        {{ title }}
      </h1>
      <div class="p-2 bg-accent/15 text-accent rounded-md">
        <icon />
      </div>
    </div>
    <div class="mt-6">
      <h1 class="text-3xl font-bold">
        {{ info }}
      </h1>
      <p class="mt-2 text-sm capitalize text-text-secondary">
        {{ bottomInfo }}
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { LucideProps } from 'lucide-vue-next';
import type { FunctionalComponent } from 'vue';
import { computed } from 'vue';
import { useRoute, type RouteLocationRaw } from 'vue-router';

const props = defineProps<{
  icon?: FunctionalComponent<LucideProps>;
  title: string;
  useRandomColor?: boolean;
  color?: string;
  isCollapsed: boolean;
  routeTo: RouteLocationRaw;
}>();

const route = useRoute();

const swatchColor = computed(() => props.color ?? generateColorFromText(props.title));

function generateColorFromText(value: string): string {
  const hue = value.split('').reduce((accumulator, letter) => accumulator + letter.charCodeAt(0), 0) % 360;

  return `hsl(${hue}, 75%, 58%)`;
}

function isRouteActive(routeTo: RouteLocationRaw) {
  if (typeof routeTo === 'string') {
    return routeTo === route.path && Object.keys(route.query).length === 0;
  }

  if (!('path' in routeTo) || routeTo.path !== route.path) {
    return false;
  }

  return Object.entries(routeTo.query ?? {}).every(([key, value]) => route.query[key] === String(value));
}
</script>

<template>
  <router-link
    :to="routeTo"
    class="interactive-nudge group flex min-h-8 items-center gap-2 rounded-md px-2 py-1"
    :class="[
      isCollapsed ? 'justify-center' : '',
      isRouteActive(routeTo) ? 'bg-accent font-bold text-bg hover:bg-accent-hover hover:text-bg' : 'text-text-secondary hover:bg-card hover:text-text-primary'
    ]"
  >
    <div
      v-if="icon"
      class="flex shrink-0 items-center"
      :class="isRouteActive(routeTo) ? 'text-bg group-hover:text-bg' : 'group-hover:text-accent'"
    >
      <icon :size="isCollapsed ? '20' : '16'" />
    </div>
    <div
      v-else-if="useRandomColor || color"
      :style="{ backgroundColor: swatchColor }"
      class="h-3 w-3 shrink-0 rounded-sm"
    />
    <div
      v-if="color && icon && !isCollapsed"
      :style="{ backgroundColor: color }"
      class="h-2 w-2 shrink-0 rounded-sm"
    />
    <span
      v-if="!isCollapsed"
      class="truncate text-sm capitalize"
    >{{ title }}</span>
  </router-link>
</template>

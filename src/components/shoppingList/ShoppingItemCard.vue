<script setup lang="ts">
import { EllipsisVertical, ExternalLink } from 'lucide-vue-next';
import type { ShoppingItem } from '../../types/ShoppingList';

defineProps<{
  item: ShoppingItem;
}>();

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function badgeStyle(color: string) {
  return {
    backgroundColor: `${color}1A`,
    borderColor: color,
    color,
  };
}

function formatPrice(price: number) {
  return currencyFormatter.format(price);
}
</script>

<template>
  <article class="relative flex h-full min-h-44 flex-col gap-5 rounded-md border-2 border-border bg-card p-4 transition duration-150 hover:border-accent">
    <button
      type="button"
      class="absolute right-2 top-2 rounded-md p-1 text-text-muted transition duration-150 hover:bg-surface hover:text-text-primary"
      aria-label="Opcoes do item"
    >
      <EllipsisVertical :size="18" />
    </button>

    <div class="flex flex-wrap items-center gap-2 pr-7">
      <span
        class="w-fit rounded-sm border px-2 py-1 text-[11px] font-semibold uppercase"
        :style="badgeStyle(item.category.color)"
      >
        {{ item.category.name }}
      </span>
      <span
        class="w-fit rounded-sm border px-2 py-1 text-[10px] font-semibold uppercase"
        :style="badgeStyle(item.status.color)"
      >
        {{ item.status.name }}
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-2">
      <a
        :href="item.link"
        target="_blank"
        rel="noopener noreferrer"
        class="group flex w-fit max-w-full items-start gap-2 text-text-primary transition duration-150 hover:text-accent"
      >
        <h1 class="line-clamp-2 text-base font-semibold leading-snug">
          {{ item.title }}
        </h1>
        <ExternalLink
          :size="14"
          class="mt-1 shrink-0 text-text-muted transition duration-150 group-hover:text-accent"
        />
      </a>
    </div>

    <div class="mt-auto border-t border-border pt-4">
      <div class="flex flex-col gap-1">
        <span class="text-[11px] font-semibold uppercase text-text-muted">Valor</span>
        <span class="text-xl font-bold text-accent">{{ formatPrice(item.price) }}</span>
      </div>
    </div>
  </article>
</template>

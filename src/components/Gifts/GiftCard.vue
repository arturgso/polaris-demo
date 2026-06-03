<script setup lang="ts">
import { EllipsisVertical, ExternalLink, Pencil, Trash2 } from 'lucide-vue-next';
import { ref } from 'vue';
import { useClickOutside } from '@/composables';
import type { GiftWithPersonId } from '@/types';

defineProps<{
  gift: GiftWithPersonId;
}>();

const emit = defineEmits<{
  edit: [gift: GiftWithPersonId];
  delete: [gift: GiftWithPersonId];
}>();

const isMenuOpen = ref<boolean>(false);
const menuRef = ref<HTMLElement | null>(null);

function handleEdit(gift: GiftWithPersonId) {
  emit('edit', gift);
  isMenuOpen.value = false;
}

function handleDelete(gift: GiftWithPersonId) {
  emit('delete', gift);
  isMenuOpen.value = false;
}

useClickOutside(menuRef, () => {
  isMenuOpen.value = false;
});
</script>

<template>
  <article
    ref="menuRef"
    class="interactive-lift relative flex h-48 flex-col gap-5 rounded-md border-2 border-border bg-card p-5 hover:border-accent"
  >
    <button
      type="button"
      class="absolute right-2 top-2 rounded-md p-1 text-text-muted transition duration-150 hover:bg-surface hover:text-text-primary"
      aria-label="Opcoes do presente"
      :aria-expanded="isMenuOpen"
      @click="isMenuOpen = !isMenuOpen"
    >
      <EllipsisVertical :size="18" />
    </button>

    <Transition name="fade-scale">
      <div
        v-if="isMenuOpen"
        class="absolute right-2 top-10 z-10 flex w-36 origin-top-right flex-col rounded-md border-2 border-border bg-surface p-1 shadow-xl"
      >
        <button
          type="button"
          class="interactive-nudge flex items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-text-secondary hover:bg-card hover:text-text-primary"
          @click="handleEdit(gift)"
        >
          <Pencil :size="14" />
          Editar
        </button>
        <button
          type="button"
          class="interactive-nudge flex items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-text-secondary hover:bg-card hover:text-text-primary"
          @click="handleDelete(gift)"
        >
          <Trash2 :size="14" />
          Deletar
        </button>
      </div>
    </Transition>

    <div class="flex flex-wrap items-center gap-2 pr-7">
      <span class="w-fit rounded-sm border border-border bg-surface px-2 py-1 text-[11px] font-semibold uppercase text-text-secondary">
        {{ gift.event || 'Nao informado' }}
      </span>
      <span class="w-fit rounded-sm border border-border bg-surface px-2 py-1 text-[10px] font-semibold uppercase text-text-secondary">
        {{ gift.status || 'Nao informado' }}
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-2">
      <a
        v-if="gift.link"
        :href="gift.link"
        target="_blank"
        rel="noopener noreferrer"
        class="group flex w-fit max-w-full items-start gap-2 text-text-primary transition duration-150 hover:text-accent"
      >
        <h1 class="line-clamp-2 text-base font-semibold leading-snug">
          {{ gift.title }}
        </h1>
        <ExternalLink
          :size="14"
          class="mt-1 shrink-0 text-text-muted transition duration-150 group-hover:text-accent"
        />
      </a>
      <h1
        v-else
        class="line-clamp-2 text-base font-semibold leading-snug text-text-primary"
      >
        {{ gift.title }}
      </h1>
    </div>

    <div class="mt-auto border-t border-border pt-4">
      <div class="flex flex-col gap-1">
        <span class="text-[11px] font-semibold uppercase text-text-muted">Para</span>
        <span class="truncate text-xl font-bold text-accent">{{ gift.giftFor }}</span>
      </div>
    </div>
  </article>
</template>

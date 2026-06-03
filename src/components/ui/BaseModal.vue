<script setup lang="ts">
import { X } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  title: string;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-overlay">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4"
        role="presentation"
        @click.self="emit('close')"
      >
        <section
          class="modal-panel flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col rounded-md border-2 border-border bg-card shadow-2xl"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <header class="flex items-center justify-between border-b border-border p-4">
            <h2 class="text-lg font-bold text-text-primary">
              {{ title }}
            </h2>
            <button
              type="button"
              class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-surface hover:text-text-primary"
              aria-label="Fechar modal"
              @click="emit('close')"
            >
              <X :size="18" />
            </button>
          </header>

          <div class="min-h-0 overflow-y-auto p-4">
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="flex flex-wrap justify-end gap-2 border-t border-border p-4"
          >
            <slot name="footer" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

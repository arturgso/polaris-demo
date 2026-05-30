<script setup lang="ts">
import { Monitor, Moon, Settings, Sun } from 'lucide-vue-next';
import type { FunctionalComponent } from 'vue';
import type { LucideProps } from 'lucide-vue-next';
import { computed } from 'vue';
import { useThemeSettings, type ThemeMode } from '../composables/useThemeSettings';

const themeOptions: Array<{
  mode: ThemeMode;
  title: string;
  description: string;
  icon: FunctionalComponent<LucideProps>;
}> = [
  {
    mode: 'light',
    title: 'Claro',
    description: 'Interface clara para ambientes iluminados.',
    icon: Sun,
  },
  {
    mode: 'dark',
    title: 'Escuro',
    description: 'Visual escuro padrao do Polaris.',
    icon: Moon,
  },
  {
    mode: 'system',
    title: 'Automatico',
    description: 'Segue a preferencia do sistema.',
    icon: Monitor,
  },
];

const {
  settings,
  resolvedTheme,
  isAmoledAvailable,
  updateMode,
  updateAmoled,
} = useThemeSettings();

const resolvedThemeLabel = computed(() => {
  const labels = {
    light: 'Claro',
    dark: 'Escuro',
    amoled: 'AMOLED',
  };

  return labels[resolvedTheme.value];
});

function handleAmoledChange(event: Event) {
  const target = event.target;

  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  updateAmoled(target.checked);
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-col gap-2">
      <div class="flex items-center gap-2 text-accent">
        <Settings :size="22" />
        <span class="text-sm font-semibold uppercase">Configuracoes</span>
      </div>
      <h1 class="text-2xl font-bold text-text-primary">
        Aparencia
      </h1>
      <p class="max-w-2xl text-sm text-text-secondary">
        Ajuste o tema visual do Polaris. As preferencias ficam salvas neste navegador.
      </p>
    </header>

    <section class="rounded-md border-2 border-border bg-card p-5 sm:p-6">
      <div class="flex flex-col gap-1">
        <h2 class="text-lg font-bold text-text-primary">
          Tema
        </h2>
        <p class="text-sm text-text-secondary">
          Escolha uma aparencia fixa ou acompanhe o sistema.
        </p>
      </div>

      <div class="mt-5 grid gap-3 md:grid-cols-3">
        <button
          v-for="option in themeOptions"
          :key="option.mode"
          type="button"
          class="flex h-full min-h-32 flex-col items-start gap-3 rounded-md border-2 p-4 text-left transition duration-150 hover:border-accent"
          :class="settings.mode === option.mode ? 'border-accent bg-bg text-text-primary' : 'border-border bg-surface text-text-secondary'"
          @click="updateMode(option.mode)"
        >
          <span
            class="flex h-9 w-9 items-center justify-center rounded-md"
            :class="settings.mode === option.mode ? 'bg-accent text-bg' : 'bg-card text-text-muted'"
          >
            <component
              :is="option.icon"
              :size="18"
            />
          </span>
          <span class="flex flex-col gap-1">
            <span class="font-bold">{{ option.title }}</span>
            <span class="text-sm text-text-muted">{{ option.description }}</span>
          </span>
        </button>
      </div>
    </section>

    <section class="rounded-md border-2 border-border bg-card p-5 sm:p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex max-w-2xl flex-col gap-1">
          <h2 class="text-lg font-bold text-text-primary">
            AMOLED
          </h2>
          <p class="text-sm text-text-secondary">
            Usa preto puro quando o tema resolvido for escuro. Disponivel em Escuro e Automatico.
          </p>
          <p class="text-sm font-semibold text-text-muted">
            Tema aplicado: {{ resolvedThemeLabel }}
          </p>
        </div>

        <label
          class="flex shrink-0 items-center gap-3 rounded-md border-2 border-border bg-surface px-3 py-2 text-sm font-semibold text-text-secondary transition duration-150"
          :class="isAmoledAvailable ? 'cursor-pointer hover:border-accent hover:text-text-primary' : 'cursor-not-allowed opacity-60'"
        >
          <input
            class="h-5 w-5 accent-accent"
            type="checkbox"
            :checked="settings.amoled"
            :disabled="!isAmoledAvailable"
            @change="handleAmoledChange"
          >
          Ativar AMOLED
        </label>
      </div>
    </section>
  </div>
</template>

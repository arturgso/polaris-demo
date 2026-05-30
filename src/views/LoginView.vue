<script setup lang="ts">
import { computed, ref } from 'vue';
import { LogIn } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseTextField from '../components/ui/BaseTextField.vue';
import {
  MOCK_AUTH_EMAIL,
  MOCK_AUTH_PASSWORD,
  MOCK_AUTH_STORAGE_KEY,
  type MockAuthSession,
} from '../constants/mockAuth';

const router = useRouter();

const email = ref<string>('');
const password = ref<string>('');
const errorMessage = ref<string>('');

const isSubmitDisabled = computed(() => email.value.trim() === '' || password.value === '');

function handleSubmit() {
  errorMessage.value = '';

  if (email.value.trim() !== MOCK_AUTH_EMAIL || password.value !== MOCK_AUTH_PASSWORD) {
    errorMessage.value = 'Email ou senha invalidos.';
    return;
  }

  const session: MockAuthSession = {
    email: MOCK_AUTH_EMAIL,
    authenticatedAt: new Date().toISOString(),
  };

  localStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(session));
  void router.push('/');
}
</script>

<template>
  <main class="flex min-h-dvh items-center justify-center bg-bg px-4 py-8">
    <section class="w-full max-w-sm rounded-md border-2 border-border bg-card p-6 shadow-2xl">
      <div class="mb-6 flex flex-col gap-2">
        <p class="text-sm font-semibold uppercase text-accent">
          Polaris
        </p>
        <h1 class="text-2xl font-bold text-text-primary">
          Entrar
        </h1>
        <p class="text-sm text-text-secondary">
          Acesse o painel com as credenciais mockadas.
        </p>
      </div>

      <form
        class="flex flex-col gap-4"
        @submit.prevent="handleSubmit"
      >
        <BaseTextField
          v-model="email"
          label="Email"
          type="email"
          placeholder="admin@polaris.local"
          required
        />

        <BaseTextField
          v-model="password"
          label="Senha"
          type="password"
          placeholder="admin"
          required
        />

        <p
          v-if="errorMessage"
          class="rounded-md border-2 border-border bg-surface px-3 py-2 text-sm font-semibold text-warning"
          role="alert"
        >
          {{ errorMessage }}
        </p>

        <BaseButton
          type="submit"
          variant="primary"
          :disabled="isSubmitDisabled"
          class="mt-2 w-full justify-center"
        >
          <template #icon>
            <LogIn :size="18" />
          </template>
          Entrar
        </BaseButton>
      </form>
    </section>
  </main>
</template>

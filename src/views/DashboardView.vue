<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ShoppingCart, TrendingUp } from 'lucide-vue-next';
import DashboardCard from '../components/dashboard/DashboardCard.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseEmptyState from '../components/ui/BaseEmptyState.vue';
import { dashboardGiftCardMock } from '../mocks/dashboardCards.mock';
import { getDashboardMetrics, getRecentShoppingItems } from '../services/dashboard';
import type { DashboardCardProps, DashboardMetricsDTO } from '../types/Dashboard';
import type { ShoppingItem } from '../types/ShoppingList';

const dashboardMetrics = ref<DashboardMetricsDTO | null>(null);
const recentShoppingItems = ref<ShoppingItem[]>([]);
const isLoadingMetrics = ref<boolean>(false);
const isLoadingRecentItems = ref<boolean>(false);
const metricsErrorMessage = ref<string>('');
const recentItemsErrorMessage = ref<string>('');

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const shoppingDashboardCards = computed<DashboardCardProps[]>(() => [
  {
    id: 1,
    icon: ShoppingCart,
    title: 'itens em compras',
    info: String(dashboardMetrics.value?.shoppingItemsCount ?? 0),
    bottomInfo: 'total cadastrados',
  },
  {
    id: 3,
    icon: TrendingUp,
    title: 'Total Compras',
    info: currencyFormatter.format(dashboardMetrics.value?.shoppingItemsTotal ?? 0),
    bottomInfo: 'soma estimada',
  },
]);

const dashboardCards = computed<DashboardCardProps[]>(() => [
  ...shoppingDashboardCards.value,
  ...dashboardGiftCardMock,
]);

async function loadDashboardMetrics() {
  isLoadingMetrics.value = true;
  metricsErrorMessage.value = '';

  try {
    dashboardMetrics.value = await getDashboardMetrics();
  } catch {
    metricsErrorMessage.value = 'Nao foi possivel carregar as metricas de compras.';
  } finally {
    isLoadingMetrics.value = false;
  }
}

async function loadRecentShoppingItems() {
  isLoadingRecentItems.value = true;
  recentItemsErrorMessage.value = '';

  try {
    recentShoppingItems.value = await getRecentShoppingItems();
  } catch {
    recentItemsErrorMessage.value = 'Nao foi possivel carregar as compras recentes.';
  } finally {
    isLoadingRecentItems.value = false;
  }
}

function loadDashboardData() {
  void loadDashboardMetrics();
  void loadRecentShoppingItems();
}

onMounted(() => {
  loadDashboardData();
});
</script>

<template>
  <div class="flex h-full flex-col items-center">
    <div class="flex w-full flex-col gap-8">
      <h1 class="text-2xl font-bold text-text-secondary">
        Dashboard
      </h1>

      <div
        v-if="metricsErrorMessage"
        class="flex w-full items-center justify-between gap-4 rounded-md border-2 border-border bg-card p-6"
      >
        <p class="text-sm text-text-secondary">
          {{ metricsErrorMessage }}
        </p>
        <BaseButton
          variant="primary"
          @click="loadDashboardMetrics"
        >
          Tentar novamente
        </BaseButton>
      </div>

      <BaseEmptyState
        v-else-if="isLoadingMetrics"
        message="Carregando metricas do dashboard..."
      />

      <div
        v-else
        class="grid w-full grid-cols-1 gap-5 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),18rem))] sm:justify-center"
      >
        <div
          v-for="item in dashboardCards"
          :key="item.id"
          class="w-full sm:max-w-72"
        >
          <DashboardCard :item="item" />
        </div>
      </div>

      <div class="grid w-full grid-cols-1 justify-items-center gap-5">
        <div class="w-full rounded-md border-2 border-border bg-card p-4 sm:p-6">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-2">
              <ShoppingCart class="text-accent" />
              <h1 class="truncate text-lg font-bold">
                Compras recentes
              </h1>
            </div>
            <h1 class="shrink-0 text-sm uppercase text-text-secondary">
              Ultimos 5
            </h1>
          </div>

          <BaseEmptyState
            v-if="isLoadingRecentItems"
            message="Carregando compras recentes..."
          />

          <div
            v-else-if="recentItemsErrorMessage"
            class="flex items-center justify-between gap-4 rounded-md border-2 border-border bg-bg p-4"
          >
            <p class="text-sm text-text-secondary">
              {{ recentItemsErrorMessage }}
            </p>
            <BaseButton
              variant="primary"
              @click="loadRecentShoppingItems"
            >
              Tentar novamente
            </BaseButton>
          </div>

          <BaseEmptyState
            v-else-if="recentShoppingItems.length === 0"
            message="Nenhuma compra recente encontrada."
          />

          <div
            v-else
            class="flex flex-col gap-2"
          >
            <div
              v-for="item in recentShoppingItems"
              :key="item.id"
            >
              <div class="flex items-start justify-between gap-3 border-t border-border py-3 sm:items-center sm:gap-4">
                <div class="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <h1 class="min-w-0 break-words capitalize text-text-primary sm:truncate">
                    {{ item.title }}
                  </h1>
                  <span class="w-fit max-w-full truncate rounded-sm bg-bg p-1 text-[12px] capitalize text-text-secondary">
                    {{ item.category.name }}
                  </span>
                </div>
                <span class="shrink-0 whitespace-nowrap text-right font-bold text-accent">{{ currencyFormatter.format(item.price) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

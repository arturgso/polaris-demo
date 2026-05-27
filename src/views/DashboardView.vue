<script setup lang="ts">
import type { FunctionalComponent } from 'vue';
import DashboardCard from '../components/dashboard/DashboardCard.vue';
import { Gift, ShoppingBag, ShoppingCart, TrendingUp, type LucideProps } from 'lucide-vue-next';

interface DashboardCardProps {
    id: number; 
    icon: FunctionalComponent<LucideProps>;
    title: string;
    info: string;
    bottomInfo: string;
}

const dashboardCardMock: DashboardCardProps[] = [
{
    id: 1,
    icon: ShoppingCart,
    title: "itens em compras",
    info: "8",
    bottomInfo: "total cadastrados"
},
{
    id: 2,
    icon: Gift,
    title: "itens em presentes",
    info: "6",
    bottomInfo: "total cadastrados"
},
{
    id: 3,
    icon: TrendingUp,
    title: "Total Compras",
    info: "R$ 1.900,10",
    bottomInfo: "soma estimada"
},
{
    id: 4,
    icon: ShoppingBag,
    title: "Total presentes",
    info: "R$ 2.780,80",
    bottomInfo: "soma estimada"
},
];

</script>

<template>
  <div class="flex flex-col justify-center items-center h-full">
    <div class="w-full">
      <h1>Dashboard</h1>
      <div class="flex flex-row justify-between">
        <div
          v-for="item in dashboardCardMock"
          :key="item.id"
        >
          <DashboardCard
            :icon="item.icon"
            :title="item.title"
            :info="item.info"
            :bottom-info="item.bottomInfo"
          />
        </div>
      </div>
    </div>
  </div>
</template>
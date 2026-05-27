<script setup lang="ts">
import { Brush, Cake, CircleQuestionMark, Cpu, Gift, Heart, LayoutDashboard, LogOut, Package, ShoppingCart, Sidebar, TreePine, type LucideProps } from 'lucide-vue-next';
import { ref, type FunctionalComponent } from 'vue';
import SidebarButton from './SidebarButton.vue';
import SidebarSection from './SidebarSection.vue';
import Divider from './Divider.vue';

interface shoppingButtonsProps {
    icon: FunctionalComponent<LucideProps>;
    title: string;
}

const shoppingButtons: shoppingButtonsProps[] = [
    {
        icon: Cpu,
        title: "tech"
    },
    {
        icon: Heart,
        title: "saúde"
    },
    {
        icon: Brush,
        title: "maquiagem"
    },
    {
        icon: Package,
        title: "outros"
    },
];

const eventsButtons: shoppingButtonsProps[] = [
    {
        icon: TreePine,
        title: "natal"
    },
    {
        icon: Cake,
        title: "Aniversário"
    },
    {
        icon: CircleQuestionMark,
        title: "não especificado"
    },
];

const persons: string[] = ["Beatriz", "Itallo", "Heloisa", "Mauricio", "Brenda", "Carlos"];

const isCollapsed = ref<boolean>(false);

function collapseSidebar() {
    isCollapsed.value = !isCollapsed.value;
}

</script>

<template>
  <aside
    :class="[
      'bg-surface fixed h-full border-r-2 border-border flex flex-col justify-between',
      isCollapsed ? 'w-12' : 'w-64'
    ]"
  >
    <div>
      <div class="p-3 relative">
        <div>
          <h1
            :class="['text-2xl font-bold text-text-secondary',
                     isCollapsed ? 'hidden' : ''
            ]"
          >
            Polaris
          </h1>

          <button
            type="button"
            :class="[
              '  text-text-muted hover:text-accent',
              isCollapsed ? '' : 'absolute right-3 top-5' 
            ]"
            @click="collapseSidebar"
          >
            <Sidebar :size="isCollapsed ? 20 : 20" />
          </button>
        </div>
      </div>

      <Divider :class="[isCollapsed ? 'hidden' : '']" />

      <SidebarSection
        :enable-title="false"
        :is-sidebar-collapsed="isCollapsed"
      >
        <div :class="[isCollapsed ? 'flex flex-col gap-2' : '']">
          <SidebarButton
            :icon="LayoutDashboard"
            title="dashboard"
            :is-collapsed="isCollapsed"
          />
          <SidebarButton
            :icon="ShoppingCart"
            title="compras"
            :is-collapsed="isCollapsed"
          />
          <SidebarButton
            :icon="Gift"
            title="presentes"
            :is-collapsed="isCollapsed"
          />
        </div>
      </SidebarSection>

      <Divider />

      <SidebarSection
        :enable-title="true"
        title="Compras"
        :is-sidebar-collapsed="isCollapsed"
      >
        <div :class="['flex flex-col', isCollapsed ? 'gap-2' : 'gap-1']">
          <div
            v-for="button in shoppingButtons"
            :key="button.title"
          >
            <SidebarButton
              :icon="button.icon"
              :title="button.title"
              :is-collapsed="isCollapsed"
            />
          </div>
        </div>
      </SidebarSection>

      <Divider />

      <SidebarSection
        :enable-title="true"
        title="Pessoas"
        :is-sidebar-collapsed="isCollapsed"
      >
        <div :class="['flex flex-col', isCollapsed ? 'gap-2' : 'gap-1']">
          <div
            v-for="person in persons"
            :key="person"
          >
            <SidebarButton
              :use-random-color="true"
              :title="person"
              :is-collapsed="isCollapsed"
            />
          </div>
        </div>
      </SidebarSection>

      <Divider />

      <SidebarSection
        :enable-title="true"
        title="Eventos"
        :is-sidebar-collapsed="isCollapsed"
      >
        <div :class="['flex flex-col', isCollapsed ? 'gap-2' : 'gap-1']">
          <div
            v-for="button in eventsButtons"
            :key="button.title"
          >
            <SidebarButton
              :icon="button.icon"
              :title="button.title"
              :is-collapsed="isCollapsed"
            />
          </div>
        </div>
      </SidebarSection>
    </div>
    <footer>
      <Divider />
      <div :class="[isCollapsed ? 'p-1' : 'p-3']">
        <button
          type="button"
          :class="[isCollapsed ? 'flex items-center justify-center w-full mb-2 hover:text-accent' : 'flex flex-row gap-2 items-center hover:text-accent px-2 py-1 rounded-md hover:bg-accent-hover/30 w-full']"
        >
          <LogOut :size="18" />
          <span v-if="!isCollapsed">Sair</span>
        </button>
      </div>
    </footer>
  </aside>
</template>

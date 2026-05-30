import { createRouter, createWebHashHistory } from 'vue-router';
import { MOCK_AUTH_STORAGE_KEY } from '../constants/mockAuth';
import DashboardView from '../views/DashboardView.vue';
import LoginView from '../views/LoginView.vue';
import SettingsView from '../views/SettingsView.vue';
import ShoppingListView from '../views/ShoppingListView.vue';

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/shopping-list',
    name: 'shoppingList',
    component: ShoppingListView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: {
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

function hasMockAuthSession() {
  return localStorage.getItem(MOCK_AUTH_STORAGE_KEY) !== null;
}

router.beforeEach((to) => {
  const isAuthenticated = hasMockAuthSession();

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { path: '/login' };
  }

  if (to.path === '/login' && isAuthenticated) {
    return { path: '/' };
  }
});

export default router;

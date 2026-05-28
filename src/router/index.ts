import { createRouter, createWebHashHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";
import ShoppingListView from "../views/ShoppingListView.vue";

const routes = [
    {
        path: '/',
        name: 'dashboard',
        component: DashboardView
    },
{
        path: '/shopping-list',
        name: 'shoppingList',
        component: ShoppingListView 
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;
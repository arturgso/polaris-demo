import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import { initializeThemeSettings } from './composables/useThemeSettings';

initializeThemeSettings();

createApp(App).use(router).mount('#app');

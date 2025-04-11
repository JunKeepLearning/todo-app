import { createApp } from 'vue';
import { createPinia } from 'pinia'
import App from './App.vue';
import router from './router';
import './style.css';     // 自定义样式（如果有的话）

const app = createApp(App);
const pinia = createPinia()

app.use(pinia);
app.use(router);
app.mount('#app');

import { createRouter, createWebHistory } from 'vue-router';
import Todos from '../views/TodoPage.vue';
import Auth from '../views/Auth.vue';
const routes = [
  { path: '/', component: Todos },
  { path: '/auth', component: Auth },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});
/*
// 建议添加路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token');
  if (to.path !== '/auth' && !isAuthenticated) {
    next('/auth');
  } else {
    next();
  }
});
*/
export default router;

<template>
  <div class="app">
    <!-- 导航栏 -->
  <nav class="bg-black shadow-sm navbar">
    <div class="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
      <h1 class="text-xl font-bold text-white">TodoList</h1>
      <div class="space-x-4">
        <router-link to="/" class="text-white hover:underline">Home</router-link>
        <router-link to="/auth" class="text-white hover:underline" v-if="!isLoggedIn">SignIn</router-link>
        <!-- 显示邮箱 -->
        <span v-if="isLoggedIn" class="text-gray-300 text-sm">
          {{ userEmail }}
        </span>
        <button 
          v-if="isLoggedIn" 
          @click="logout" 
          class="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
        >
          SignOut
        </button>
      </div>
  </div>
</nav>


    <!-- 路由视图 -->
    <main>
      <router-view></router-view>
      <SpeedInsights />
    </main>
  </div>
</template>

<script setup>
// 导入需要的逻辑 
import { computed , onMounted } from 'vue'; // 引入 Vue 的响应式 API
import { useRouter } from 'vue-router'; // 引入 Vue Router
import { useAuthStore } from './stores/auth';
import { SpeedInsights } from "@vercel/speed-insights/vue" // 引入vercel的速度分析组件

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isAuthenticated);
// 邮箱掩码函数
const maskEmail = (email) => 
  email ? email.replace(/^(.).+(.)(@.+)$/, (_, a, b, c) => `${a}***${b}${c}`) : '';
// 获取邮箱
const userEmail = computed(() => authStore.currentUser ? maskEmail(authStore.currentUser.email) : '');
const router = useRouter(); // 使用 Vue Router 来处理路由

// 登出函数
const logout = async () => {
 try {
  await authStore.logout();
  localStorage.removeItem('token'); // 清除 token
  router.push('/auth');
  } catch (error) {
  console.error('登出失败:', error);
  }
}

onMounted(async () => {
    await authStore.initAuth(); // 👈 页面加载时初始化用户状态
});
</script>

<style scoped>
/* 页面布局 */
.app {
  text-align: center;
  font-family: Arial, sans-serif;
  min-height: 100vh; /* 保证页面填满屏幕 */
}
</style>

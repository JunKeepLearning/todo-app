<template>
  <main class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black to-purple-900 text-white font-sans m-0">
    <div class="auth-form">
      <h2> {{ currentPage === 'login' ? '登录' : '注册' }} </h2>
      <form @submit.prevent="currentPage === 'login' ? handleLogin() : handleRegister()">
        <div class="form-group">
          <label for="email">邮箱：</label>
          <input 
            v-model="form.email" 
            type="email" 
            id="email" 
            placeholder="请输入邮箱" 
            required 
            class="text-black"
          />
        </div>
        <div class="form-group">
          <label for="password">密码：</label>
          <input 
            v-model="form.password" 
            type="password" 
            id="password" 
            placeholder="请输入密码" 
            required 
            class="text-black"
          />
        </div>
        <button type="submit">
          {{ currentPage === 'login' ? '登录' : '注册' }}
        </button>
        <p>
          {{ currentPage === 'login' ? '还没有账号？' : '已经有账号？' }}
          <a 
            @click="togglePage" 
            class="text-blue-300 hover:text-blue-500 underline cursor-pointer"
          >
            {{ currentPage === 'login' ? '注册' : '登录' }}
          </a>
        </p>
      </form>
    </div>
  </main>
</template>
  
<script setup>
import { ref, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // 引入 useRouter
import { useAuthStore } from '../stores/auth';

//路由
const router=useRouter();
// 页面状态管理
const currentPage = ref('login'); // 'login', 'register'
// 登录信息
const authStore = useAuthStore();
// 数据
const form = ref({email: '',password: ''});

const togglePage = () =>{
  currentPage.value = currentPage.value === 'login' ? 'register' : 'login';
  form.value.email = '';
  form.value.password = '';
}

const handleLogin = async () => {
  try {
    console.log(`登录中...邮箱: ${form.value.email}`);
    const { email, password } = form.value; // 解构出最新值
    await authStore.login(email, password);
    if (authStore.isAuthenticated) {
      router.push('/'); // 登录成功后跳转到首页
    } else {
      alert('登录失败，请检查您的邮箱和密码。');
    }
  } catch (error) {
    console.error('登录过程中发生错误:', error);
    alert('登录失败，请稍后重试。');
  }
};

// 处理注册逻辑
const handleRegister = async () => {
  try {
    console.log(`注册邮箱: ${form.value.email}`);
    const { email, password } = form.value; // 解构出字符串

    // 调用注册接口
    await authStore.register(email, password);
    console.log("token.value: ", authStore.token);
    console.log("authStore.isAuthenticated: ", authStore.isAuthenticated);
    if (authStore.isAuthenticated) {
      // 注册成功后跳转到登录页
      currentPage.value = 'login';
      form.value.password = ''; // 清空密码字段
      console.log("注册成功，跳转到登录页");
    } else {
      alert('注册失败，请检查您的邮箱和密码。');
    }
  } catch (error) {
    console.error('注册过程中发生错误:', error);
    alert('注册失败，请稍后重试。');
  }
};

</script>

<style scoped>
.login,.register {
  width: 300px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 15px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #2980b9;
}
</style>
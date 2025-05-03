// stores/auth.js

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  userSignIn,
  userSignOut,
  userSignUp,
  getCurrentUser,
  refreshUserToken
} from '../api'; // 自定义的 API 请求封装
import { useTodoStore } from './todo';
import { useErrorStore } from './error';

export const useAuthStore = defineStore('auth', () => {
  // 当前登录用户对象
  const user = ref(null);

  // token，从 localStorage 初始化（防止刷新丢失）
  const token = ref(localStorage.getItem('token') || null);

  // 引入错误信息存储
  const errorStore = useErrorStore();

  // 是否认证（只要 token 存在就认为是已登录）
  const isAuthenticated = computed(() => !!token.value);

  // 获取当前用户信息
  const currentUser = computed(() => user.value);

  // ✅ 设置用户认证信息
  const setAuthData = (responseData) => {
    // 打印响应数据，检查其结构
    console.log("setAuthData的参数: ", responseData);
  
    // 检查响应数据的有效性：必须包含 access_token 和 user
    if (!responseData?.access_token || !responseData?.user) {
      errorStore.setError('无效的认证响应数据');
      throw new Error('无效的认证响应数据');
    }
  
    // 从响应数据中提取 access_token 和 user 信息
    const { access_token, user: userData } = responseData;
  
    // 设置用户对象
    user.value = {
      id: userData.id, // 用户 ID
      email: userData.email, // 用户邮箱
      emailVerified: userData.email_confirmed_at !== null, // 判断邮箱是否已确认
      metadata: userData.user_metadata, // 用户附加元数据
    };
  
    // 保存 token 和用户信息到 localStorage，以便后续使用
    token.value = access_token;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user.value));
  
    // 如果后端返回了 token 过期时间，则保存到 localStorage
    if (responseData.expires_at) {
      localStorage.setItem('tokenExpiration', responseData.expires_at);
    }
  
    // 可选：如果没有返回 expires_at，可以考虑手动设置过期时间（例如 1 小时后）
    // 如果后端没有提供 token 过期时间，可以在这里设置一个默认的过期时间（如 3600 秒，即 1 小时）
    // const expirationTime = 3600; // 过期时间 1 小时
    // const expiresAt = Date.now() / 1000 + expirationTime;
    // localStorage.setItem('tokenExpiration', expiresAt);
  };
  

  // ✅ 登录操作
  const login = async (email, password) => {
    try {
      const res = await userSignIn(email, password);
      // console.log("登录，返回的结果: ", res);
      if(res){
      setAuthData({
          access_token: res.access_token,
          user: res.user
      });
      }
      const todoStore = useTodoStore();
      await todoStore.syncLocalTodos();

      return true;
    } catch (error) {
      errorStore.setError(`登录失败: ${error.message}`);
      console.error('登录失败:', error);
      return false; // 返回 false 表示登录失败
    }
  };

  // ✅ 注册操作
  const register = async (email, password) => {
    try {
      const res = await userSignUp(email, password);
      // console.log("注册，返回的结果: ", res);
      if (res) {
        setAuthData({
          access_token: res.access_token,
          user: res.user
        });
      }
      return res;
    } catch (error) {
      errorStore.setError(`注册失败: ${error.message}`);
      throw error;
    }
  };

  // ✅ 登出操作
  const logout = async () => {
    try {
      await userSignOut();
    } finally {
      user.value = null;
      token.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiration');
    }
  };

  // ✅ 页面加载时刷新 token（防止 token 过期）
  const refreshTokenOnPageLoad = async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const tokenExpiration = localStorage.getItem('tokenExpiration');
    const currentTime = Date.now();

    if (storedToken && tokenExpiration && currentTime > parseInt(tokenExpiration)) {
      console.log('Token 已过期，正在刷新...');
      try {
        const refreshedSession = await refreshUserToken(); // 自定义刷新 API
        token.value = refreshedSession.access_token;
        localStorage.setItem('token', refreshedSession.access_token);
        localStorage.setItem('tokenExpiration', refreshedSession.expires_at);
        user.value = storedUser ? JSON.parse(storedUser) : null;
      } catch (error) {
        console.error('刷新 token 失败:', error);
        user.value = null;
      }
    }
  };

  // ✅ 初始化函数：App 加载时调用
  const initAuth = async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
    }

    // 可选：尝试刷新过期 token
    await refreshTokenOnPageLoad();
  };

  // ✅ 返回整个 Store 的响应式数据和方法
  return {
    user,
    token,
    isAuthenticated,
    currentUser,
    login,
    register,
    logout,
    refreshTokenOnPageLoad,
    initAuth, // 👈 记得暴露给组件使用
  };
});

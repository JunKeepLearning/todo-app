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
    if (!responseData?.access_token || !responseData?.user) {
      errorStore.setError('无效的认证响应数据');
      throw new Error('无效的认证响应数据');
    }

    const { access_token, user: userData } = responseData;

    // 设置用户对象
    user.value = {
      id: userData.id,
      email: userData.email,
      emailVerified: userData.email_confirmed_at !== null,
      metadata: userData.user_metadata,
    };

    // 保存 token 和用户信息到 localStorage
    token.value = access_token;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user.value));

    // 保存 token 过期时间（假设你有从后端拿到 expires_at）
    if (responseData.expires_at) {
      localStorage.setItem('tokenExpiration', responseData.expires_at);
    }
  };

  // ✅ 登录操作
  const login = async (email, password) => {
    try {
      const res = await userSignIn(email, password);
      setAuthData({
        access_token: res.access_token,
        user: res.user,
        expires_at: res.expires_at,
      });

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
      if (res) {
        setAuthData({
          access_token: res.access_token,
          user: res.user,
          expires_at: res.expires_at,
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

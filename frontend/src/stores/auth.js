import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userSignIn, userSignOut, userSignUp } from '../api'

export const useAuthStore = defineStore('auth', () => {
  // 状态定义
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  
  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)
  const authToken = computed(() => token.value)

  // 设置用户和token（适配Supabase返回格式）
  const setAuthData = (responseData) => {
    if (!responseData?.access_token || !responseData?.user) {
      throw new Error('无效的认证响应数据')
    }

    // 提取关键数据
    const { access_token, user: userData } = responseData
    
    // 标准化用户信息
    user.value = {
      id: userData.id,
      email: userData.email,
      emailVerified: userData.email_confirmed_at !== null,
      metadata: userData.user_metadata
    }
    
    token.value = access_token
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  // 登录方法（适配Supabase）
  const login = async (credentials) => {
    try {
      const res = await userSignIn(credentials);
      // console.log("credentials:   ",credentials);
      console.log("完整登录响应:",res);
      
      setAuthData(res);
      return true;
    } catch (error) {
      console.error('登录失败:', {
        error: error.response?.data || error.message,
        request: credentials
      });
      throw error // 抛出错误供组件处理
    }
  }

  // 注册方法
  const register = async (userData) => {
    try {
      const res = await userSignUp(userData)
      // 注册后自动登录（根据业务需求决定）
      if (res.data?.access_token) {
        setAuthData(res.data)
      }
      return res.data
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    }
  }

  // 登出方法
  const logout = async () => {
    try {
      await userSignOut()
    } finally {
      // 无论API是否成功都清除本地状态
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  // 初始化时恢复用户状态
  const initAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken) {
      token.value = storedToken
      try {
        user.value = storedUser ? JSON.parse(storedUser) : null
      } catch {
        user.value = null
      }
    }
  }

  return {
    // 状态
    user,
    token,
    
    // 计算属性
    isAuthenticated,
    currentUser,
    authToken,
    
    // 方法
    login,
    register,
    logout,
    initAuth
  }
})
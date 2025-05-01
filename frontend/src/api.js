// src/api.js
// ----------- 用于前端直接使用supabase auth --------------
import { createClient } from '@supabase/supabase-js';

// 从环境变量中获取 Supabase 的 URL 和密钥
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // Supabase 项目的 URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY; // Supabase 项目的密钥
const supabase = createClient(supabaseUrl, supabaseKey); // 创建 Supabase 客户端实例

// ------------- 用于前端通过后端对supabase进行数据库操作 --------------
import axios from 'axios';

// 从环境变量中获取后端 API 的基础 URL
const apiUrl = import.meta.env.VITE_API_BASE_URL; // 后端 API 的基础 URL

// 创建一个 Axios 实例，用于与后端通信
const api = axios.create({
  baseURL: apiUrl, // 设置后端 API 的基础 URL
  timeout: 10000, // 设置请求超时时间为 10 秒
});

// 请求拦截器：在每次请求中自动添加 Authorization 头部
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('token'); // 从 localStorage 中获取存储的 token
    const tokenExpiration = localStorage.getItem('tokenExpiration'); // 获取 token 的过期时间
    const currentTime = Date.now(); // 获取当前时间

    // 检查 token 是否过期，如果过期则尝试刷新 token
    if (token && tokenExpiration && currentTime > parseInt(tokenExpiration)) {
      console.log('Token 已过期，正在刷新...');
      try {
        const refreshedSession = await refreshUserToken(); // 调用刷新 token 的方法
        token = refreshedSession?.access_token; // 获取新的 token
        localStorage.setItem('token', token); // 保存新的 token
        localStorage.setItem('tokenExpiration', refreshedSession.expires_at); // 更新过期时间
      } catch (error) {
        console.error('刷新 token 失败:', error); // 刷新 token 失败时输出错误
        throw new Error('无法刷新 token');
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 如果 token 存在，添加到请求头中
    }

    return config; // 返回修改后的配置
  },
  (error) => {
    return Promise.reject(error); // 如果请求拦截器出错，返回错误
  }
);

// --------------- CRUD 操作 --------------------------------
// 获取所有待办项
export const getTodoItems = async () => {
  const response = await api.get('/todos'); // 向后端发送 GET 请求以获取待办项
  return response.data; // 返回响应数据
};

// 创建待办项
export const createTodoItem = async (todo) => {
  const response = await api.post('/todos', todo); // 向后端发送 POST 请求以创建新的待办项
  return response.data; // 返回创建的待办项数据
};

// 更新待办项
export const updateTodoItem = async (id, todo) => {
  const response = await api.patch(`/todos/${id}`, todo); // 向后端发送 PATCH 请求以更新指定 ID 的待办项
  return response.data; // 返回更新后的待办项数据
};

// 删除待办项
export const deleteTodoItem = async (id) => {
  await api.delete(`/todos/${id}`); // 向后端发送 DELETE 请求以删除指定 ID 的待办项
};

// 批量同步待办事项到 Supabase
export const syncTodoItems = async (todos) => {
  const response = await api.post('/todos/batch', { todos }); // 向后端发送批量同步请求
  return response.data; // 返回同步结果
};

// ------------------- AUTH ----------------------------
// 用户注册
export const userSignUp = async (email, password) => {
  const { user, error } = await supabase.auth.signUp({ email, password }); // 使用 Supabase 的 auth.signUp 方法注册用户
  if (error) throw error; // 如果发生错误，抛出错误
  return user; // 返回注册的用户信息
};

// 用户登录
export const userSignIn = async (email, password) => {
  const { session, user, error } = await supabase.auth.signInWithPassword({ email, password });
  console.log('signInWithPassword response:', { session, user, error }); // 添加日志记录返回值
  if (error) throw error;
  if (!session) throw new Error('登录失败，未能获取有效的会话信息');
  return { access_token: session.access_token, user }; // 返回包含 access_token 和 user 的对象
};

// 获取当前用户
export const getCurrentUser = () => {
  return supabase.auth.user(); // 使用 Supabase 的 auth.user 方法获取当前登录的用户信息
};

// 用户登出
export const userSignOut = async () => {
  const { error } = await supabase.auth.signOut(); // 使用 Supabase 的 auth.signOut 方法登出用户
  if (error) throw error; // 如果发生错误，抛出错误
  return null; // 返回 null 表示用户已登出
};

// 刷新 token 方法
export const refreshUserToken = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  return {
    access_token: data.session.access_token,
    expires_at: data.session.expires_at
  }; // 返回包含 access_token 和 expires_at 的对象
};

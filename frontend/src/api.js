// src/api.js
import axios from 'axios';

// 创建一个 Axios 实例
const api = axios.create({
  baseURL: 'http://localhost:8000', // 后端 API 的基础 URL
  timeout: 10000, // 设置超时
});

// 请求拦截器：每次请求自动加上 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // 从 localStorage 读取 token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // 设置请求头
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 获取所有待办项
export const getTodoItems = async () => {
  const response = await api.get('/todos');
  return response.data;
};

// 创建待办项
export const createTodoItem = async (todo) => {
  const response = await api.post('/todos', todo);
  return response.data;
};

// 更新待办项
export const updateTodoItem = async (id, todo) => {
  const response = await api.patch(`/todos/${id}`, todo);
  return response.data;
};

// 删除待办项
export const deleteTodoItem = async (id) => {
  await api.delete(`/todos/${id}`);
};

// 注册
export const userSignUp = async (credentials) => {
  const response = await api.post('/auth/register', credentials);
  return response.data;
};

// 登录
export const userSignIn = async (userData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

// 登出
export const userSignOut = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};


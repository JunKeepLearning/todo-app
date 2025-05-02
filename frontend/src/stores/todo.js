// todo.js
import { defineStore } from 'pinia';  // 引入 Pinia 的 defineStore 用来创建 Store
import { getTodoItems, createTodoItem, updateTodoItem, deleteTodoItem } from '../api';  // 引入 API 请求函数
import { ref } from 'vue'; // 引入 Vue 的 ref 响应式
import { useAuthStore } from './auth'; // 引入认证 Store
import { useErrorStore } from './error'; // 引入错误处理 Store
import { v4 as uuidv4 } from 'uuid'; // 引入 UUID 库来生成唯一的 id

// 创建一个名为 'todo' 的 Store
export const useTodoStore = defineStore('todo', () => {
  // ------------------ 响应式状态 ------------------
  const todos = ref([]); // 保存待办事项列表
  const loading = ref(false); // 保存加载状态（比如请求进行中）
  const errorStore = useErrorStore(); // 错误处理 Store
  const authStore = useAuthStore(); // 认证（登录状态）Store

  // ------------------ 工具函数 ------------------

  // 从 localStorage 加载本地的待办事项
  const loadLocalTodos = () => {
    try {
      const localTodos = localStorage.getItem('todos');
      todos.value = Array.isArray(JSON.parse(localTodos)) ? JSON.parse(localTodos) : [];
    } catch (err) {
      errorStore.setError('加载本地待办事项失败！');
      console.error(err);
      todos.value = []; // 确保 todos 始终是数组
    }
  };

  // 把当前待办事项列表保存到 localStorage
  const saveLocalTodos = () => {
    localStorage.setItem('todos', JSON.stringify(todos.value));
  };

  // ------------------ 主要操作函数 ------------------

  // 获取服务器上的待办事项（如果未登录，就加载本地的）
  const fetchTodos = async () => {
    if (!authStore.isAuthenticated) {
      loadLocalTodos();
      return;
    }

    loading.value = true;
    try {
      const fetchedTodos = await getTodoItems();
      todos.value = Array.isArray(fetchedTodos) ? fetchedTodos : [];
    } catch (err) {
      errorStore.setError('获取待办事项失败！');
      console.error(err);
      todos.value = []; // 确保 todos 始终是数组
    } finally {
      loading.value = false;
    }
  };

  // 添加一个新的待办事项
  const addTodo = async (todo) => {
    if (!authStore.isAuthenticated) {
      // 如果没登录，给待办事项生成一个唯一的 id
      todo.id = uuidv4();  // 使用 UUID 生成唯一 id
      todos.value.push(todo);  // 添加到本地待办列表
      saveLocalTodos();  // 保存到 localStorage
      console.log('待办事项已添加到本地: ', todo);
      
      return;
    }
  
    loading.value = true;
    try {
      const newTodo = await createTodoItem(todo); // 调 API 创建
      todos.value.push(newTodo); // 添加到待办列表
      console.log('待办事项已添加到云端: ', newTodo);
    } catch (err) {
      errorStore.setError('添加待办事项失败！');
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // 同步本地的待办事项到服务器（适合登录后同步）
  const syncLocalTodos = async () => {
    if (!authStore.isAuthenticated) return; // 没登录就不用同步

    const localTodos = JSON.parse(localStorage.getItem('todos') || '[]');
    if (localTodos.length === 0) return; // 没有待同步的就退出

    loading.value = true;
    try {
      for (const todo of localTodos) {
        await createTodoItem(todo); // 把每一个本地待办推送到服务器
      }
      localStorage.removeItem('todos'); // 同步完清空本地待办
      await fetchTodos(); // 重新拉取最新数据
    } catch (err) {
      errorStore.setError('同步待办事项失败！');
      console.error(err);
    } finally {
      loading.value = false;
    }
  };
  // 删除
  const deleteTodo = async (id) => {
    if (!authStore.isAuthenticated) {
      todos.value = todos.value.filter((todo) => todo.id !== id);
      
      console.log('待办事项已从本地删除: ', id);
      saveLocalTodos();
      return;
    }
  
    loading.value = true;
    try {
      await deleteTodoItem(id);
      todos.value = todos.value.filter((todo) => todo.id !== id);
      console.log('待办事项已从云端删除: ', id);
    } catch (err) {
      errorStore.setError('删除待办事项失败！');
      console.error(err);
    } finally {
      loading.value = false;
    }
  };
  // 编辑
  const updateTodo = async (updatedTodo) => {
    if (!authStore.isAuthenticated) {
      const index = todos.value.findIndex((todo) => todo.id === updatedTodo.id);
      if (index !== -1) {
        todos.value[index] = updatedTodo;
        saveLocalTodos();
        console.log('待办事项已更新到本地: ', updatedTodo);
      }
      return;
    }
  
    loading.value = true;
    try {
      const result = await updateTodoItem(updatedTodo);
      const index = todos.value.findIndex((todo) => todo.id === result.id);
      if (index !== -1) {
        todos.value[index] = result;
        console.log('待办事项已更新到云端: ', result);
      }
    } catch (err) {
      errorStore.setError('更新待办事项失败！');
      console.error(err);
    } finally {
      loading.value = false;
    }
  };
  
  // ------------------ 对外暴露 ------------------
  return {
    todos,
    loading,
    fetchTodos,
    addTodo,
    syncLocalTodos,
    deleteTodo,
    updateTodo
  };
});

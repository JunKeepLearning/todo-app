// todo.js
import { defineStore } from 'pinia';  // 引入 Pinia 的 defineStore 用来创建 Store
import { getTodoItems, createTodoItem, updateTodoItem, deleteTodoItem, syncTodoItems } from '../api';  // 引入 API 请求函数
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

  // ------------------ 处理localstorage数据 ------------------

  // 从 localStorage 加载本地的待办事项
  const loadLocalTodos = () => {
    try {
      const localTodos = localStorage.getItem('todos');
      todos.value = Array.isArray(JSON.parse(localTodos)) ? JSON.parse(localTodos) : [];
      console.log('本地的待办事项: ', todos.value);
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
      console.log("fetchTodos: 用户未登录，已加载本地待办事项");
      return;
    }

    loading.value = true;
    try {
      const fetchedTodos = await getTodoItems();
      console.log('fetchTodos - 从 getTodoItems 获取的原始数据:', fetchedTodos);

      if (!Array.isArray(fetchedTodos)) {
        throw new Error('fetchTodos - 获取的数据格式不正确，期望是数组');
      }

      todos.value = fetchedTodos;
      console.log('fetchTodos - 更新后的待办事项:', todos.value);
    } catch (err) {
      errorStore.setError('获取待办事项失败！');
      console.error('fetchTodos - 错误信息:', err.message);
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
      saveLocalTodos(); // 保存到 localStorage
      console.log("newTodo: ", todo);
      console.log('待办事项已添加到本地: ', todo);
      return;
    }

    loading.value = true;
    try {
      const newTodo = await createTodoItem(todo); // 调 API 创建
      // todos.value.push(newTodo.todo); // 添加到待办列表
      console.log('待办事项已添加到云端: ', newTodo.todo);
    } catch (err) {
      errorStore.setError('添加待办事项失败！');
      console.error(err);
    } finally {
      loading.value = false;
      fetchTodos(); //刷新todos.value
    }
  };

  // 同步本地的待办事项到服务器（适合登录后同步）
  const syncLocalTodos = async () => {
    if (!authStore.isAuthenticated) return; // 没登录就不用同步
  
    const localTodos = JSON.parse(JSON.stringify(todos.value));
  
    if (localTodos.length === 0) return; // 没有待同步的就退出
  
    loading.value = true;
    try {
      // 获取服务器上的待办事项
      const serverTodos = await getTodoItems();
      console.log('服务器上的待办事项:', serverTodos);
  
      // 过滤出本地新增或修改的待办事项
      const todosToSync = localTodos.filter(localTodo => {
        const matchingServerTodo = serverTodos.find(serverTodo => serverTodo.id === localTodo.id);
        return (
          !matchingServerTodo || // 本地新增的待办事项
          JSON.stringify(matchingServerTodo) !== JSON.stringify(localTodo) // 本地修改的待办事项
        );
      });
  
      if (todosToSync.length === 0) {
        console.log('没有需要同步的待办事项');
        return;
      }
  
      console.log('准备同步的待办事项:', todosToSync);
  
      // 调用批量同步 API
      const syncedTodos = await syncTodoItems(todosToSync);
      console.log('同步结果:', syncedTodos);
  
      // 清空本地存储
      localStorage.removeItem('todos');
      console.log('本地待办事项已同步到服务器并清除本地数据');
  
      // 重新获取后端数据
      await fetchTodos();
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
  const updateTodo = async (id, updatedTodo) => {
    if (!authStore.isAuthenticated) {
      const index = todos.value.findIndex((todo) => todo.id === id);
      if (index !== -1) {
        todos.value[index] = { ...todos.value[index], ...updatedTodo };
        console.log("todos.value[index]: ", todos.value[index]);
        saveLocalTodos();
        console.log('待办事项已更新到本地: ', todos.value[index]);
      }
      return;
    }

    loading.value = true;
    try {
      console.log('更新待办事项请求数据:', id, updatedTodo); // 打印请求数据
      const result = await updateTodoItem(id, updatedTodo); // 调用 API 更新后端数据
      console.log('更新待办事项成功:', result);

      if (result?.todo) { // 检查 result 是否包含 todo
        const index = todos.value.findIndex((todo) => todo.id === result.todo.id);
        if (index !== -1) {
          todos.value[index] = result.todo; // 同步更新本地数据
        }
      } else {
        console.warn('更新待办事项返回的数据格式不正确:', result);
      }
    } catch (err) {
      errorStore.setError('更新待办事项失败！');
      console.error('更新待办事项错误:', err.response || err.message);
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

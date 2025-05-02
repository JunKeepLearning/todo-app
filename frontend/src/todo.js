import { reactive } from 'vue';
import { getTodoItems } from '@/api/todo';

const todoStore = reactive({
  todos: [], // 确保 todos 初始化为数组
});

export const syncLocalTodos = async () => {
  try {
    const todos = await getTodoItems();
    if (Array.isArray(todos)) {
      todoStore.todos = todos;
    } else {
      console.error('获取的待办项数据格式不正确:', todos);
      alert('同步失败：后端返回的数据格式不正确。'); // 添加用户提示
      todoStore.todos = [];
    }
  } catch (error) {
    console.error('同步待办项失败:', error);
    alert('同步失败：请检查网络连接或稍后重试。'); // 添加用户提示
    todoStore.todos = [];
  }
};
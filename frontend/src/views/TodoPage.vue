<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black to-purple-900 text-white font-sans m-0">
      <!-- 错误提示 -->
      <ErrorMessage v-if="errorStore.errorMessage" :message="errorStore.errorMessage" />
      <!-- 加载中 -->
      <div v-if="loading" class="text-center py-8 text-gray-500">
        正在加载待办事项...
      </div>
  
      <!-- 正常内容 -->
      <div v-else>
        <!-- 输入框：添加新的待办 -->
        <TodoInput
          :editingTodo="editingTodo"
          @submit="handleAdd"
          @cancelEdit="editingTodo = null"
        />
  
        <!-- 筛选器 -->
        <TodoFilters 
          :modelValuePriority="filterPriority"
          :modelValueStatus="filterStatus"
          @update:modelValuePriority="value => filterPriority = value"
          @update:modelValueStatus="value => filterStatus = value" 
        />
  
        <!-- 待办列表 -->
        <TodoList 
          :todos="filteredTodos" 
          @delete="handleRemove" 
          @update="id => setEditingTodoById(id)" 
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useTodoStore } from '../stores/todo';
  import { useErrorStore } from '../stores/error';
  
  import TodoInput from '../components/TodoInput.vue';
  import TodoFilters from '../components/TodoFilters.vue';
  import TodoList from '../components/TodoList.vue';
  import ErrorMessage from '../components/ErrorMessage.vue';
  import { useAuthStore } from '../stores/auth';

  
  const todoStore = useTodoStore();
  const errorStore = useErrorStore();
  const authStore = useAuthStore();
  
  const loading = ref(false);
  const editingTodo = ref(null);

  // 筛选条件
  const filterPriority = ref('');
  const filterStatus = ref('');
  
  const handleError = (message, error) => {
    errorStore.setError(message);
    console.log('handleError called with message:', message, 'and error:', error);
  };
  
  // 处理添加待办
  const handleAdd = async (newTodo) => {
    try {
      if(editingTodo.value){
        console.log("Editing todo:", editingTodo.value);
        // 编辑模式
        await todoStore.updateTodo(editingTodo.value.id, { ...newTodo });
        console.log('Todo updated successfully:', newTodo);

      } else {
        // 新增模式
        await todoStore.addTodo(newTodo);
        console.log('Todo added successfully:', newTodo); // 打印待办事项数据
      }
    } catch (error) {
      handleError('添加失败，请重试', error);
    } finally {
      editingTodo.value = null;
    }
  };
  
  // 删除todo
  const handleRemove = async (id) => {
    try {
      await todoStore.deleteTodo(id);
      console.log('删除成功---待办事项:', id);
    } catch (error) {
      handleError('删除失败，请重试', error);
    }
  };


  // 设置编辑中的待办事项--用于update
  const setEditingTodoById = (id) => {
    const todo = todoStore.todos.find(todo => todo.id === id);
    if (todo) {
      editingTodo.value = { ...todo };
    }
  };

  // 先加载，再 fetch（更推荐）
const loadTodos = async () => {
  loading.value = true;
  try {
    if (!authStore.isAuthenticated) {
      await todoStore.fetchTodos(); // 如果未登录，仅加载本地数据
    } else {
      await todoStore.syncLocalTodos(); // 同步本地数据到远程
      await todoStore.fetchTodos(); // 加载远程数据覆盖本地
    }
  } catch (error) {
    handleError('加载数据失败', error);
  } finally {
    loading.value = false;
  }
};



  onMounted(() => {
    console.log("authStore.isAuthenticated" , authStore.isAuthenticated);
    console.log('Component mounted.');
    loadTodos();
  });
  // 筛选器
  const filterTodos = (todos, priority, status) => {
  return todos.filter(todo => {
    const priorityMatch = !priority || todo.priority === priority;
    const statusMatch = !status || todo.status === status;
    return priorityMatch && statusMatch;
  });
};
const filteredTodos = computed(() =>
  filterTodos(todoStore.todos || [], filterPriority.value, filterStatus.value)
);

  </script>
  
  <style scoped>

  </style>

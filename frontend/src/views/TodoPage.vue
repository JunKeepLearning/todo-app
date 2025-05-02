<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black to-purple-900 text-white font-sans m-0">
      <!-- 错误提示 -->
      <ErrorMessage v-if="errorStore.error" :message="errorStore.error" />
  
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
  
  const todoStore = useTodoStore();
  const errorStore = useErrorStore();
  
  const loading = ref(false);
  const editingTodo = ref(null);

  // 筛选条件
  const filterPriority = ref('');
  const filterStatus = ref('');
  
  const handleError = (message, error) => {
    errorStore.setError(message);
    console.error(message, error);
  };
  
  // 处理添加待办
  const handleAdd = async (newTodo) => {
    try {
      if(editingTodo.value){
        // 编辑模式
        console.log("编辑中: ", editingTodo.value)
        await todoStore.updateTodo(editingTodo.value.id, { ...newTodo });
        console.log('更新----成功--待办事项:', newTodo);

      } else {
        // 新增模式
        await todoStore.addTodo(newTodo);
        console.log('添加----成功--待办事项:', newTodo); // 打印待办事项数据
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

  // 加载待办事项
  const loadTodos = async () => {
    loading.value = true;
    try {
      await todoStore.fetchTodos();
    } catch (error) {
      handleError('加载待办事项失败，请刷新重试', error);
    } finally {
      loading.value = false;
    }
  };
  
  onMounted(loadTodos);
  
  const filteredTodos = computed(() => {
    const todos = Array.isArray(todoStore.todos) ? todoStore.todos : [];
    return todos.filter(todo => {
      const priorityMatch = !filterPriority.value || todo.priority === filterPriority.value;
      const statusMatch = !filterStatus.value || todo.status === filterStatus.value;
      return priorityMatch && statusMatch;
    });
  });
  </script>
  
  <style scoped>

  </style>

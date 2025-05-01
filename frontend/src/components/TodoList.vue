<!-- TodoList.vue -->
<template>
    <table class="todo-table w-full">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <!-- 监听并再向上传递 -->
        <TodoItem 
          v-for="item in todos" 
          :key="item.id" 
          :item="item" 
          @update="$emit('update', $event)"   
          @delete="$emit('delete', $event)"
        />
      </tbody>
    </table>
  </template>
  
  <script setup>
  import TodoItem from './TodoItem.vue';
  import{ ref } from 'vue';
  // 定义列标题
  const columns = ref(['任务', '优先级', '状态', '完成时间', '操作']);

  // todos
  defineProps({
  todos: Array,
})
  </script>
  
  <style scoped>
  .todo-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .todo-table th, .todo-table td {
    padding: 10px;
    text-align: center;
    border-right: 2px solid rgba(255, 255, 255, 0.3);
  }
  
  .todo-table th {
    background-color: rgba(200, 200, 200, 0.2);
    font-weight: bold;
  }

.todo-table tr:hover {
  background-color: rgba(200, 200, 200, 0.1);
}

.todo-table, .todo-table th, .todo-table td {
  border: 1px solid rgba(200, 200, 200, 0.3);
}
  </style>
  
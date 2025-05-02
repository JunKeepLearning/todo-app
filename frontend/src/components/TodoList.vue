<!-- TodoList.vue -->
<template>
  <div>
    <table class="todo-table w-full">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="todos.length">
          <TodoItem 
            v-for="item in todos" 
            :key="item.id" 
            :item="item" 
            @update="$emit('update', $event)"   
            @delete="$emit('delete', $event)"
          />
        </template>
        <tr v-else>
          <td :colspan="columns.length" class="text-center text-gray-500 py-4">
            暂无待办事项
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import TodoItem from './TodoItem.vue';
import{ ref } from 'vue';
// 定义列标题
const columns = ref(['任务', '优先级', '状态', '完成时间', '操作']);

// todos
defineProps({
todos: {
  type: Array,
  // required: true,
},
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
